const express = require('express');
const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/stuff');
const multer = require('../middleware/multer-config');

const router = express.Router();



router.post('/', auth, multer, stuffCtrl.createBook);
router.put('/:id', auth, multer, stuffCtrl.modifyBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.get('/:id', stuffCtrl.getOneBook);
router.get('/', stuffCtrl.getAllBooks);

  module.exports = router;