const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./routes/User');
const path = require('path');

const stuffRoutes = require('./routes/stuff')

//Connexion BDD
mongoose.connect('mongodb+srv://piko83:Job-456@monvieuxgrimoire.usck1ea.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

  //ALLOW CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Gestion de la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/books', stuffRoutes);
app.use('/api/auth', userRoutes);



module.exports = app;