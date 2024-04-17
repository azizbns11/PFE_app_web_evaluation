// dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/top", dashboardController.getTopSuppliers);
router.get("/total-suppliers", dashboardController.getTotalSuppliers); // Added route for getTotalSuppliers
router.get("/total-employees", dashboardController.getTotalEmployees);

module.exports = router;
