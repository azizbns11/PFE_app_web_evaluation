const Certificate = require("../models/certificate");
const User = require("../models/user");
const Notification = require("../models/notification");
const multer = require("multer");
const path = require("path");
const { getIo } = require("../SocketIo");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "file/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const certificateController = {
  addCertificate: async (req, res) => {
    try {
      upload.single("certificateFile")(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return res.status(500).json({ message: "File upload error" });
        } else if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server Error" });
        }

        try {
          const {
            SupplierName,
            ExpireDate,
            RecertificateDate,
            CertificateNumber,
            CertificateName,
          } = req.body;
          const certificateFile = req.file ? req.file.filename : undefined;
          const supplier = await User.findOne({ groupName: SupplierName });
          if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
          }

          let userRole = req.userRole;

          let notificationMessage = "";

          if (userRole === "supplier") {
            // If supplier adds a certificate, send notification to admin and employee
            notificationMessage = `New certificate added by ${SupplierName}`;

            console.log(
              `Supplier added a certificate. Sending notification to admin and employee.`
            );
            const adminAndEmployeeUsers = await User.find({
              role: { $in: ["admin", "employee"] },
            });
            const notificationData = {
              message: notificationMessage,
              type: "certificate",
            };
            await Promise.all(
              adminAndEmployeeUsers.map(async (user) => {
                console.log(`Notification sent `);
                const adminAndEmployeeNotification = new Notification({
                  userId: user._id,
                  ...notificationData,
                });
                await adminAndEmployeeNotification.save();
              })
            );
          } else {
          
            notificationMessage = `You have a new certificate: ${CertificateName}`;

            console.log(
              `Admin or employee added a certificate. Sending notification to supplier: ${supplier.groupName}`
            );
            console.log(`supplier id: ${supplier._id}`);
            const supplierNotification = new Notification({
              userId: supplier._id,
              message: notificationMessage,
              type: "certificate",
            });
            await supplierNotification.save();
          }

          const newCertificate = new Certificate({
            SupplierName,
            supplierId: supplier._id,
            ExpireDate,
            RecertificateDate,
            CertificateNumber,
            CertificateName,
            CertificateFile: certificateFile,
          });
     
          const savedCertificate = await newCertificate.save();

          if (userRole === "admin" || userRole === "employee") {
            userRole = userRole; // Use the role of the user who added the certificate
          } else {
            userRole = "supplier"; // Default to "supplier" if neither admin nor employee
          }

          const notificationData = {
            userRole: userRole,
            supplierId: savedCertificate.supplierId,
          };
          console.log("notif data", notificationData);
          const io = getIo();

          io.emit("newCertificate", notificationData);
          res.status(201).json(savedCertificate);
        } catch (error) {
          console.error("Error adding certificate:", error);
          res.status(500).json({ error: "Server error" });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  
  getAllCertificates: async (req, res) => {
    try {
      const userId = req.userId; 
      const userRole = req.userRole;

      let certificates = [];

     
      if (userRole === "supplier") {
        certificates = await Certificate.find({ supplierId: userId });
      } else {
       
        certificates = await Certificate.find();
      }

      res.json(certificates);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },

  getCertificateById: async (req, res) => {
    try {
      const certificateId = req.params.id;
      const certificate = await Certificate.findById(certificateId);

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.json(certificate);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },

  getCertificateFile: async (req, res) => {
    try {
      const filename = req.params.filename;
      console.log("Requested filename:", filename);
      const filePath = path.join(__dirname, "../file/", filename);
      console.log("File path:", filePath);
      res.sendFile(filePath);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },

  updateCertificateById: async (req, res) => {
    try {
      
      upload.single("certificateFile")(req, res, async function (err) {
     
        if (err instanceof multer.MulterError) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "certificateFile upload error" });
        } else if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server Error" });
        }

        console.log("Updating Certificate by ID:", req.params.id);
        const {
          SupplierName,
          ExpireDate,
          RecertificateDate,
          CertificateNumber,
          CertificateName,
        } = req.body;
        const certificateFile = req.file ? req.file.filename : undefined;

     
        let updatedCertificateData = {
          SupplierName,
          ExpireDate,
          RecertificateDate,
          CertificateNumber,
          CertificateName,
          CertificateFile: certificateFile, 
        };

        
        const updatedCertificate = await Certificate.findByIdAndUpdate(
          req.params.id,
          updatedCertificateData,
          { new: true }
        );

        console.log("Certificate updated:", updatedCertificate);

     
        if (!updatedCertificate) {
          return res.status(404).json({ message: "Certificate not found" });
        }

     
        const notificationDate = new Date(updatedCertificateData.ExpireDate);
        notificationDate.setDate(notificationDate.getDate() - 90);

  
        const notification = new Notification({
          userId: updatedCertificate.supplierId,
          message:
            "Your certificate is expiring soon. Please take necessary actions.",
            type:'certificate'
        });
        await notification.save();

      
        res.json({
          message: "Certificate updated successfully",
          certificate: updatedCertificate,
        });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },
  deleteCertificateById: async (req, res) => {
    try {
      const certificateId = req.params.id;
      const deletedCertificate = await Certificate.findByIdAndDelete(
        certificateId
      );

      if (!deletedCertificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.json({ message: "Certificate deleted successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },
  getCertificateBySupplierId: async (req, res) => {
    try {
      const { id } = req.params;
      const certificates = await Certificate.find({ supplierId: id });
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates details:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
};
module.exports = certificateController;

