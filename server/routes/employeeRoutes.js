const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

// Route to get all employees
router.get("/", employeeController.getAllEmployees);
router.put('/:id', employeeController.updateEmployeeById);
router.delete('/:id', employeeController.deleteEmployeeById);
module.exports = router;
