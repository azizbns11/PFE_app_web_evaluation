const User = require("../models/user");
const Evaluation = require("../models/evaluation");
const Certificate = require("../models/certificate");
const Protocol =require("../models/protocol")
const supplierController = {
  getAllSuppliers: async (req, res) => {
    try {
      const suppliers = await User.find({ role: "supplier", groupName: { $exists: true, $ne: "" } });
      res.json(suppliers);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },

  // Function to get supplier by id
  getSupplierById: async (req, res) => {
    try {
      const supplier = await User.findById(req.params.id);
      console.log("Supplier found:", supplier);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },

  updateSupplierById: async (req, res) => {
    try {
      console.log("Updating supplier by ID:", req.params.id);
      // Destructure fields from the request body
      const {
        groupName,
        address,
        codeTVA,
        codeDUNS,
        phone,
        country,
        email,
        zipCode,
        fax,
        street,
        province,
      } = req.body;

      // Update supplier in the database
      const updatedSupplier = await User.findByIdAndUpdate(
        req.params.id,
        {
          groupName,
          address,
          codeTVA,
          codeDUNS,
          phone,
          country,
          email,
          zipCode,
          fax,
          street,
          province,
        },
        { new: true } // Return the updated document
      );

      // Log updated supplier
      console.log("Supplier updated:", updatedSupplier);

      // Handle case where supplier is not found
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      // Update associated evaluations
      await Evaluation.updateMany(
        { supplierId: req.params.id },
        { $set: { SupplierName: groupName } } // Update SupplierName to match the updated groupName
      );
      await Protocol.updateMany(
        { supplierId: req.params.id },
        { $set: { supplierName: groupName } } // Update supplierName to match the updated groupName
      );
      await Certificate.updateMany(
        { supplierId: req.params.id },
        { $set: { SupplierName: groupName } } // Update supplierName to match the updated groupName
      );
      res.json(updatedSupplier);
    } catch (error) {
      // Log and handle errors
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  deleteSuppliereById: async (req, res) => {
    try {
      const supplierId = req.params.id;

      // Delete the supplier
      const deletedSupplier = await User.findByIdAndDelete(supplierId);

      if (!deletedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      // Delete associated certificates
      await Certificate.deleteMany({ supplierId: supplierId });

      // Delete associated evaluations
      await Evaluation.deleteMany({ supplierId: supplierId });

      res.json({
        message: "Supplier, certificates, and evaluations deleted successfully",
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const userId = req.userId;
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }
      res.status(200).json(currentUser);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },


};

module.exports = supplierController;
