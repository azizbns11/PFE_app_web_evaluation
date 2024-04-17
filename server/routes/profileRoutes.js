// profileRoutes.js
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

// Define the route for updating user profile
router.put("/:id", profileController.updateProfile);

// Define the route for fetching user profile by ID
router.get("/fetch/:id", profileController.fetchUserProfile); // Define route to fetch user profile by ID

// Define the route for fetching user name by ID
router.get("/fetchUserName/:id", profileController.fetchUserName);
router.get("/all", profileController.getAllUsers);
module.exports = router;
