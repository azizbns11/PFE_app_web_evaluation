
const Protocol = require('../models/protocol');
const User = require('../models/user');
const Notification=require('../models/notification')
const multer = require('multer');
const path = require('path');
const { getIo } = require("../SocketIo");
const sendNotification = require('../utils/Notification');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'file/') 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

const protocolController = {
  addProtocol: async (req, res) => {
    try {
      const userRole = req.userRole;
  
      upload.single("file")(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return res.status(500).json({ message: "File upload error" });
        } else if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server Error" });
        }
  
        try {
          const { supplierName, status, protocolTitle } = req.body;
          const ProtocolFile = req.file ? req.file.filename : undefined;
          const supplier = await User.findOne({ groupName: supplierName });
          if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
          }
  
          if (userRole === "supplier") {
            const notificationMessage = `New protocol added by ${supplierName}`;
            //console.log( `Supplier added a protocol. Sending notification to admin and employee.`);
            const adminAndEmployeeUsers = await User.find({
              role: { $in: ["admin", "employee"] },
            });
            const notificationData = {
              message: notificationMessage,
              type: "protocol",
        
            };
      
            await Promise.all(
              adminAndEmployeeUsers.map(async (user) => {
                //console.log(`Notification sent to ${user.role}`);
                const adminAndEmployeeNotification = new Notification({
                  userId: user._id,
                  ...notificationData,
                });
                await adminAndEmployeeNotification.save();
              })
            );
  
            const newProtocol = new Protocol({
              supplierName,
              supplierId: supplier._id,
              status,
              protocolTitle,
              ProtocolFile,
            });
  
            const savedProtocol = await newProtocol.save();
  
            const io = getIo();
            io.emit("newProtocol", notificationData);
  
            // Send email notifications
            const nonSupplierUsers = await User.find({
              role: { $ne: "supplier" },
            });
            const emailPromises = nonSupplierUsers.map((user) => {
              const emailMessage = `New protocol "${protocolTitle}" added by ${supplierName} and requires validation.`;
              return sendNotification(
                user.email,
                "New Protocol Added",
                emailMessage,
                "protocol"
              );
            });
            await Promise.all(emailPromises);
  
            res.status(201).json(savedProtocol);
          }
        } catch (error) {
          console.error("Error adding protocol:", error);
          res.status(500).json({ error: "Server error" });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  
  getAllProtocols: async (req, res) => {
    try {
      const userId = req.userId;
      const userRole = req.userRole; 
  
      let protocols = [];
      if (userRole === 'supplier') {
       protocols = await Protocol.find({ supplierId: userId });
      } else {
       
        protocols = await Protocol.find();
      }
      res.json(protocols);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  },
  
  getProtocolById: async (req, res) => {
    try {
      const protocolId = req.params.id;
      const protocol = await Protocol.findById(protocolId);
      
      if (!protocol) {
        return res.status(404).json({ message: 'protocol not found' });
      }

      res.json(protocol);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  getProtocolFile: async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(__dirname, '../file/', filename);
      res.sendFile(filePath);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  },
  deleteProtocolById : async (req, res) => {
    try {
      const protocolId = req.params.id;
      const deletedProtocol = await Protocol.findByIdAndDelete(protocolId);
  
      if (!deletedProtocol) {
        return res.status(404).json({ message: 'Protocol not found' });
      }
  
      res.json({ message: 'Protocol deleted successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  },
  updateProtocolById: async (req, res) => {
    try {
      upload.single('ProtocolFile')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return res.status(500).json({ message: 'ProtocolFile upload error' });
        } else if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server Error' });
        }
    
        //console.log("Updating Protocol by ID:", req.params.id);
        const { supplierName, status, protocolTitle } = req.body;
        const ProtocolFile = req.file ? req.file.filename : undefined;
    
        let updatedProtocolData = {
          supplierName,
          status,
          protocolTitle,
          ProtocolFile: ProtocolFile
        };
    
        const updatedProtocol = await Protocol.findByIdAndUpdate(
          req.params.id,
          updatedProtocolData,
          { new: true }
        );
    
        //console.log("Protocol updated:", updatedProtocol);
    
        if (!updatedProtocol) {
          return res.status(404).json({ message: "Protocol not found" });
        }
    
       // console.log("User role:", req.userRole);
    
        if (status === 'validated' || status === 'invalid') {
          const supplier = await User.findOne({ groupName: supplierName });
      
          let notificationMessage;
          if (status === 'validated') {
            notificationMessage = `Your protocol has been validated.`;
          } else {
            notificationMessage = `Your protocol has been marked as invalid.`;
          }
    
      
      
          const io = getIo();
          io.emit("newProtocolStatus", { groupName: supplierName });
 
        
          const notification = new Notification({
            userId: supplier._id,
            message: notificationMessage,
            type: 'protocol'
          });
          await notification.save();
    
          await sendNotification(supplier.email, status === 'validated' ? 'Protocol Validated' : 'Protocol Invalidated', notificationMessage, 'protocol');
        }
    
        res.json({ message: 'Protocol updated successfully', protocol: updatedProtocol });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  },
  
  
  

  getProtocolBySupplierId : async (req, res) => {
    try {
      const { id } = req.params;
      const protocols = await Protocol.find({ supplierId: id });
      res.json(protocols);
    } catch (error) {
      console.error("Error fetching protocol details:", error);
      res.status(500).json({ message: "Server Error" });
    }},
    getAllProtocolStatus: async (req, res) => {
      try {
        const protocols = await Protocol.find();
        const protocolStatuses = protocols.map(protocol => protocol.status);
        res.json(protocolStatuses);
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
      }
    },


    getProtocolStatusBySupplierId: async (req, res) => {
      try {
        const { id } = req.params;
        const protocols = await Protocol.find({ supplierId: id });
        const protocolStatuses = protocols.map(protocol => ({
          protocolId: protocol._id,
          status: protocol.status
        }));
        res.json(protocolStatuses);
      } catch (error) {
        console.error("Error fetching protocol statuses:", error);
        res.status(500).json({ message: "Server Error" });
      }
    },
    
};

module.exports = protocolController;
/*    getProtocolsBySupplierId: async (req, res) => {
      try {
        const { id } = req.params;
        const protocols = await Protocol.find({ supplierId: id });
        res.json(protocols);
      } catch (error) {
        console.error("Error fetching protocols for supplier:", error);
        res.status(500).json({ message: "Server Error" });
      }
    },*/