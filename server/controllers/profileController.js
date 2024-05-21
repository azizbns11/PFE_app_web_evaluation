


const User = require("../models/user");
const bcrypt = require("bcryptjs");
const multer = require("multer"); 
const path = require("path");
const defaultImagePath = "uploads/1713021632381.png";
const cloudinary = require("../utils/cloudinary");
const multerMiddleware = require("../middleware/Multer");
const fs = require("fs");


const profileController = {
 
  updateProfile: async (req, res) => {
    multerMiddleware(req, res, async (err) => {
      if (err) {
        console.error("Error uploading image:", err);
        return res.status(500).json({ message: "Error uploading image" });
      }

      const imagePath = req.file ? req.file.path : defaultImagePath;

      try {
      
        const result = await cloudinary.uploader.upload(imagePath);

      
        if (req.file) {
          fs.unlinkSync(imagePath);
        }

       
        const imageUrl = result.secure_url;

   
        const userId = req.params.id;
        const updatedProfileData = req.body;

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

  
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

  
        if (updatedProfileData.newPassword) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(updatedProfileData.newPassword, saltRounds);
          user.password = hashedPassword;
        }

    
        user.image = imageUrl;

    
        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  },

  fetchUserProfile: async (req, res) => {
    const userId = req.params.id;

 
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

   
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
  
      res.status(200).json({ userName, image: user.image });
    } catch (error) {
      console.error("Error fetching user name:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
getAllUsers: async (req, res) => {
  try {
    const users = await User.find();
   
    const usersWithImageURLs = users.map(user => ({
      ...user.toJSON(),
      image: `${user.image}` 
    }));
    res.json(usersWithImageURLs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
}
,

  
};

module.exports = profileController;