const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliersController");
const { authenticateJWT } = require('../middleware/authenticateJWT');

router.get('/currentUser', authenticateJWT, suppliersController.getCurrentUser);
router.get("/", suppliersController.getAllSuppliers);
router.get("/:id", suppliersController.getSupplierById);
router.put("/:id", suppliersController.updateSupplierById);
router.delete('/:id', suppliersController.deleteSuppliereById);

module.exports = router;
