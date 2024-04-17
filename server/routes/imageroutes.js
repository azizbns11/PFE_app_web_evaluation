const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Define storage for the uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Store images in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use unique filenames
  }
});

// Check file type to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and JPG file types are allowed!'), false);
  }
};

// Initialize multer middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Route to handle image upload
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file!' });
    }

    // Get the file path
    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);

    // Return the file path (or URL) to the client
    res.status(200).json({ url: imagePath }); // You may need to replace imagePath with the actual URL of your image server
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image. Please try again later.' });
  }
});

module.exports = router;
