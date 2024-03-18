const Book = require('../models/book');
const fs = require('fs');


exports.createBook = (req, res, next) => {
  // Stockage de la requête sous forme de JSON dans une constante (requête sous la forme form-data à l'origine)
  const bookObject = JSON.parse(req.body.book);
  // Suppression du faux _id envoyé par le front
  delete bookObject._id;
  // Suppression de _userId auquel on ne peut faire confiance
  delete bookObject._userId;
  // Création d'une instance du modèle Book
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      averageRating: bookObject.ratings[0].grade
  });
  // Enregistrement dans la base de données
  book.save()
      .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
      .catch(error => { res.status(400).json( { error }) })
};
exports.modifyBook = async (req, res, next) => {
    // Check if a file is included in the request
    try {
      const bookObject = req.file
          // If so, convert request JSON to Object
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          }
          // If not, use data from req.body
        : { ...req.body } 
  
      delete bookObject._userId
  
       // Retrieves book that match the id specified in the request params
      const book = await Book.findOne({ _id: req.params.id })
  
      // Check if user is authorized to modify the book
      if (book.userId != req.auth.userId) {
        return res.status(403).json({message: 'Unauthorized request'})
      }
  
      // If request contain a file, remove the old file from the back end (images folder)
      if (req.file) {
        const filename = book.imageUrl.split('/images/')[1]
        fs.unlinkSync(`images/${filename}`)
      }
          // Update book
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
    res.status(200).json({ message: 'Book modified!' })
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

  exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ "message":"objet non trouvé" }));
  };
  
  exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
  }

  exports.getBestRatedBooks = (req, res, next) => {
    console.log('cc')
    Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .then(topRatedBooks => {
        res.status(200).json(topRatedBooks);
      })
      .catch(error => {
        res.status(500).json({ error: 'An error has occurred' });
      });
  };
  


 //exports.addBookRating = async (req, res, next) => {
 //  // Check that the user has not already rated the book
 //  const existingRating = await Book.findOne({
 //   _id: req.params.id,
 //   "ratings.userId": req.body.userId
 // })
 // if (existingRating) {
 //   return res.status(400).json({ message: 'User has already rated this book' })
 // }
 //
 // // Check that the rating is a number between 0..5 included
 // if(!(req.body.rating  >= 0) && !(req.body.rating  <= 5) && (typeof req.body.rating === 'number')){
 //   return res.status(500).json({ message: 'Grade is not between 0 and 5 included or is not a number' })
 // }
 //
 // try {
 //   // Retrieves the book to rate according to the id of the request
 //   const book = await Book.findOne({ _id: req.params.id })
 //   if (!book) {
 //     return res.status(404).json({ message: 'Book not found' })
 //   }
 //
 //   // Add a new rating to the ratings array of the book
 //   book.ratings.push({ userId : req.body.userId, grade: req.body.rating })
 //
 //   // Save the book to MongoDB, averageRating will be up to date on save
 //   await book.save()
 //   res.status(200).json(book)
 // } catch (error) {
 //   console.error(error)
 //   res.status(500).json({ message: 'An error has occurred' })
 // }
 //
 
 exports.addBookRating = (req, res, next) => {
    // Check that the user has not already rated the book
    Book.findOne({
      _id: req.params.id,
      "ratings.userId": req.body.userId
    })
    .then(existingRating => {
      if (existingRating) {
        return res.status(400).json({ message: 'User has already rated this book' });
      }
  
      // Check that the rating is a number between 0..5 included
      if (!(req.body.rating >= 0) || !(req.body.rating <= 5) || (typeof req.body.rating !== 'number')) {
        return res.status(400).json({ message: 'Grade is not between 0 and 5 included or is not a number' });
      }
  
      // Retrieves the book to rate according to the id of the request
      return Book.findOne({ _id: req.params.id });
    })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Add a new rating to the ratings array of the book
      book.ratings.push({ userId: req.body.userId, grade: req.body.rating });
  
      // Save the book to MongoDB, averageRating will be up to date on save
      return book.save();
    })
    .then(book => {
      res.status(200).json(book);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'An error has occurred' });
    });
  };
  