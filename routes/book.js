const express = require('express');
const auth = require('../middleware/auth');
const bookCtrl = require('../controllers/book');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');
const router = express.Router();



router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.put('/:id', auth, multer, sharp, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBooks);


router.get('/bestrating', bookCtrl.getTopRatedBooks)
router.post('/:id/rating', auth, bookCtrl.addBookRating)

//router.get('/bestrating', bookCtrl.getBestRating);
//router.post('/:id/rating', auth, bookCtrl.createRating);



  module.exports = router;