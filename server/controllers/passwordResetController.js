
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");

const passwordController = {
  requestPasswordReset: async (email) => {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User does not exist");

    
      await Token.deleteMany({ userId: user._id });

     
      const resetToken = crypto.randomBytes(32).toString("hex");

   
      await new Token({
        userId: user._id,
        token: resetToken,
        createdAt: Date.now(),
      }).save();

   
      const resetLink = `http://localhost:3000/resetpassword?resetToken=${resetToken}`;

   
      await sendEmail(user.email, "Password Reset Request", resetLink);

      return resetLink;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw new Error("Failed to request password reset");
    }
},

resetPassword: async (resetToken, newPassword) => {
    try {
       

        const tokenInfo = await Token.findOne({ token: resetToken });

  
        if (!tokenInfo) {
            console.error("Token not found");
            throw new Error("Invalid reset token");
        }

        
        const userId = tokenInfo.userId;

     
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

       
        await Token.deleteOne({ token: resetToken });

        console.log("Password reset successful");
        return "Password reset successful";
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error; 
    }
},
};
module.exports = passwordController;
