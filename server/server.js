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

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userId) => {
    console.log("Received user ID:", userId);
    socket.join(userId);
    console.log("User connected:", userId);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
