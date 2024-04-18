const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and JPG file types are allowed!'), false);
  }
};


const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
  
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file!' });
    }

  
    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);

    res.status(200).json({ url: imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image. Please try again later.' });
  }
});

module.exports = router;
