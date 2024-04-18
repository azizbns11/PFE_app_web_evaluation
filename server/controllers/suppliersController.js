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
        { new: true }
      );

     
      console.log("Supplier updated:", updatedSupplier);

   
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

    
      await Evaluation.updateMany(
        { supplierId: req.params.id },
        { $set: { SupplierName: groupName } }
      );
      await Protocol.updateMany(
        { supplierId: req.params.id },
        { $set: { supplierName: groupName } } 
      );
      await Certificate.updateMany(
        { supplierId: req.params.id },
        { $set: { SupplierName: groupName } } 
      );
      res.json(updatedSupplier);
    } catch (error) {
   
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
  deleteSuppliereById: async (req, res) => {
    try {
      const supplierId = req.params.id;
  
      console.log("Deleting supplier with ID:", supplierId);
  
      const deletedSupplier = await User.findByIdAndDelete(supplierId);
  
      if (!deletedSupplier) {
        console.log("Supplier not found:", supplierId);
        return res.status(404).json({ message: "Supplier not found" });
      }
  
      console.log("Deleted supplier:", deletedSupplier);
  
      const deleteCertificatesResult = await Certificate.deleteMany({ supplierId: supplierId });
  
      console.log("Deleted certificates:", deleteCertificatesResult);
  
      const deleteEvaluationsResult = await Evaluation.deleteMany({ supplierId: supplierId });
  
      console.log("Deleted evaluations:", deleteEvaluationsResult);
  
      res.json({
        message: "Supplier, certificates, and evaluations deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
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
