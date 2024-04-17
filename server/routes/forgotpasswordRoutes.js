const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/authenticateJWT");
const { requestPasswordReset, resetPassword } = require("../controllers/passwordResetController");
const passwordResetController = require("../controllers/passwordResetController");


router.use((req, res, next) => {
  if (req.path !== "/resetpassword") {
    authenticateJWT(req, res, next);
  } else {
    next();
  }
});


router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;
  try {
    const token = await requestPasswordReset(email);
    res.status(200).json({ message: "Reset password email sent successfully", token });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ message: "Failed to send reset password email" });
  }
});

router.post("/resetpassword/:resetToken", async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;
  try {
  
    const message = await passwordResetController.resetPassword(resetToken, newPassword);
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.message === "Invalid reset token") {
      res.status(400).json({ message: "Invalid reset token" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }


});




module.exports = router;
