const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./routes/User');
const path = require('path');

const booksRoutes = require('./routes/book')
const dotenv = require('dotenv').config()

//Connexion BDD
mongoose.connect(`mongodb+srv://${process.env.LOGIN_MONGO}:${process.env.PASSWORD_MONGO}@monvieuxgrimoire.usck1ea.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

// Express rate limit
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})


const helmet = require('helmet');

// Use Helmet!
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Apply the rate limiting middleware to all requests.
app.use(limiter)

  //ALLOW CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Gestion de la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);



module.exports = app;