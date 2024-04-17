const User = require("../models/user"); // Import the User model
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const defaultImagePath = "uploads/1713021632381.png";
// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Directory where images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Set up multer upload
const upload = multer({ storage: storage }).single("image"); // 'image' is the name attribute of your input field

const profileController = {
  // Controller method to update user profile by ID
  updateProfile: async (req, res) => {
    // Handle image upload
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading image:", err);
        return res.status(500).json({ message: "Error uploading image" });
      }

      // Access uploaded image file path via req.file.path
      const imagePath = req.file ? req.file.path :  defaultImagePath; ;

      const userId = req.params.id; // Get the user ID from the request parameters
      const updatedProfileData = req.body; // Get the updated profile data from the request body

      try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update profile fields based on user role
        switch (user.role) {
          case "admin":
          case "employee":
            user.firstName = updatedProfileData.firstName;
            user.lastName = updatedProfileData.lastName;
            user.position = updatedProfileData.position;
            user.phone = updatedProfileData.phone;
            break;
          case "supplier":
            user.groupName = updatedProfileData.groupName;
            user.codeTVA = updatedProfileData.codeTVA;
            user.province = updatedProfileData.province;
            user.codeUser = updatedProfileData.codeUser;
            user.codeDUNS = updatedProfileData.codeDUNS;
            user.fax = updatedProfileData.fax;
            user.zipCode = updatedProfileData.zipCode;
            user.country = updatedProfileData.country.toString(); 
            user.phone = updatedProfileData.phone;
            user.address = updatedProfileData.address;
            break;
          default:
            break;
        }

        // Check if new password is provided
        if (updatedProfileData.newPassword) {
          // Hash the new password before saving
          const saltRounds = 10; // Adjust salt rounds as needed
          const hashedPassword = await bcrypt.hash(
            updatedProfileData.newPassword,
            saltRounds
          );
          user.password = hashedPassword;
        }

        // Update image path if an image was uploaded
        if (imagePath) {
          user.image = imagePath;
        }

        // Save the updated user data
        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  },
  // Controller method to fetch user profile by ID
  fetchUserProfile: async (req, res) => {
    const userId = req.params.id; // Get the user ID from the request parameters

    // Check if user ID is null or empty
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send the user data as response
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  fetchUserName: async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      let userName = "";
  
      if (user.role === "admin" || user.role === "employee") {
        userName = user.firstName;
      } else if (user.role === "supplier") {
        userName = user.groupName;
      }
  
      res.status(200).json({ userName, image: user.image }); // Include image path
    } catch (error) {
      console.error("Error fetching user name:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
getAllUsers: async (req, res) => {
  try {
    const users = await User.find();
    // Modify user objects to include complete image URLs
    const usersWithImageURLs = users.map(user => ({
      ...user.toJSON(),
      image: `${req.protocol}://${req.get('host')}/${user.image}` // Constructing complete image URL
    }));
    res.json(usersWithImageURLs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
}

  
};

module.exports = profileController;