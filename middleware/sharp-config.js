const sharp = require('sharp');
const fs = require('fs').promises;

const compressImage = async (req, res, next) => {
  if (req.file) {
    console.log(req.file);
    try {
      const newFilename = req.file.filename.replace(/\.[^.]+$/, ".webp");
      await sharp(req.file.path)
        .resize({ width: 206, height: 260 })
        .webp({ quality: 50 })
        .toFile(`images/${newFilename}`);

      const originalImagePath = req.file.path; 
      req.file.path = `images/${newFilename}`;
      req.file.filename = newFilename;
      req.file.mimetype = "image/webp";
      console.log(req.file);

      setTimeout(async () => {
        try {
          await fs.unlink(originalImagePath); 
          console.log("Image d'origine supprimé");
        } catch (error) {
          console.error("Erreur suppression image:", error);
        }
      }, 1000); 
    } catch (error) {
      console.error("Erreur compression image:", error);
      return res.status(500).json({ message: 'Failed to compress image', error });
    }
  }
  next();
};

module.exports = compressImage;
