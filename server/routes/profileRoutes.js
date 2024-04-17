
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");


router.put("/:id", profileController.updateProfile);

router.get("/fetch/:id", profileController.fetchUserProfile);


router.get("/fetchUserName/:id", profileController.fetchUserName);
router.get("/all", profileController.getAllUsers);
module.exports = router;
