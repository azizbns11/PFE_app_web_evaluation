const socketIo = require("socket.io");

let io;

function initSocket(server) {
  io = socketIo(server, {
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

    socket.on("new message", (newMessageReceived) => {
      var chat = newMessageReceived.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id == newMessageReceived.sender._id) return;

        io.to(user._id).emit("message received", newMessageReceived);
      });
    });

    socket.on("newCertificate", (notificationData) => {
      console.log("Received new certificate event");

      const { userRole, supplierId } = notificationData;

      if (userRole === "supplier") {
        io.to("admin").emit("newCertificate", "You have a new certificate");
        io.to("employee").emit("newCertificate", "You have a new certificate");
      } else {
        io.to(supplierId).emit("newCertificate", "You have a new certificate");
      }
    });
    socket.on("newProtocol", (notificationData) => {
      console.log("Received new protocol event");

      const { userRole, supplierId, supplierName, protocolTitle } =
        notificationData;

      if (userRole !== "supplier") {
        io.to("admin").emit("newProtocol", { supplierName, protocolTitle });
        io.to("employee").emit("newProtocol", { supplierName, protocolTitle });
      }
    });
    socket.on("updateProtocolStatus", (notificationData) => {
      console.log("Received protocol status update event");

      const { supplierId, status } = notificationData;

      io.to(supplierId).emit(
        "newProtocolStatus",
        `Your protocol has been ${
          status === "validated" ? "validated" : "marked as invalid"
        }.`
      );
    });

    socket.on("newEvaluation", (notificationData) => {
      console.log("Received new evaluation event");

      const { userRole, supplierId } = notificationData;

      if (userRole === "supplier") {
        io.to(supplierId).emit("newEvaluation", "You have a new evaluation");
        console.log("Notification sent to supplier:", supplierId);
      } else {
        console.log(
          "New evaluation added by admin/employee, no notification sent to supplier."
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
}

module.exports = {
  initSocket,
  getIo,
};
