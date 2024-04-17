require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Db");
const app = express();
const authController = require("./controllers/authController");
const emailController = require("./controllers/emailController"); // Import emailController module
const authRoutes = require("./routes/authRoutes");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const evaluationRoutes = require("./routes/evaluationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const profileRoutes = require("./routes/profileRoutes");
const protocolRoutes = require("./routes/protocolRoutes");
const forgotpasswordRoutes = require("./routes/forgotpasswordRoutes");
const notificationRoutes=require("./routes/notificationRoutes");
const dashboardRoutes=require("./routes/dashboardRoutes")
const { authenticateJWT } = require("./middleware/authenticateJWT");




app.use(cors());
app.use(express.json());
connectDB();

const { preRegisterAdmin } = require("./controllers/authController");
const { sendEmail } = require("./controllers/emailService");

app.use("/", authRoutes);
// Serve static files
app.use("/uploads", express.static("uploads"));
app.use("/file", express.static(path.join(__dirname, "file")));

app.post("/register", authController.registerNewUser);
app.post("/login", authController.loginUser);
app.post("/forgotpassword", forgotpasswordRoutes);
app.post("/resetpassword/:resetToken", forgotpasswordRoutes);
preRegisterAdmin();

app.use(bodyParser.json());
app.use(authenticateJWT);
app.post("/send-email", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Call the sendEmail function from the email service
    await sendEmail(email, password);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

app.use("/profile", profileRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
// Set up routes for suppliers and employees
app.use("/api/suppliers", supplierRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api", protocolRoutes);
app.use("/api", dashboardRoutes);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

