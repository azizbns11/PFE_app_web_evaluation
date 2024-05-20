require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Db");
const app = express();
const authController = require("./controllers/authController");
const emailController = require("./controllers/emailController");
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
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { authenticateJWT } = require("./middleware/authenticateJWT");
const chatRoutes = require("./routes/chatRoutes");
const exportRoutes=require("./routes/exportRoutes")
const { initSocket } = require("./SocketIo");
app.use(cors());
app.use(express.json());
connectDB();

const { preRegisterAdmin } = require("./controllers/authController");
const { sendEmail } = require("./controllers/emailService");

app.use("/", authRoutes);

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

app.use("/api/suppliers", supplierRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api", protocolRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", chatRoutes);
app.use("/api",exportRoutes)
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
initSocket(server);


// Test schedule notification
/*const {
  checkEvaluationsForNotification,
  checkCertificatesForNotification
} = require('../server/services/notificationService');

// Manually trigger evaluation notification check
checkEvaluationsForNotification();

// Manually trigger certificate expiration check
checkCertificatesForNotification();*/

