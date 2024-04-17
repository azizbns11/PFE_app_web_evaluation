const User = require("../models/user");

const employeeController = {
  getAllEmployees: async (req, res) => {
    try {
      const employees = await User.find({ role: "employee", firstName: { $exists: true, $ne: "" } });
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  },

  updateEmployeeById : async (req, res) => {
    try {
      console.log("Updating employee by ID:", req.params.id);
      
      
      const { firstName, lastName, position } = req.body;
  
      let updatedEmployeeData = {
        firstName: firstName,
        lastName: lastName,
        position: position
      };
      
     
      const updatedEmployee = await User.findByIdAndUpdate(
        req.params.id,
        updatedEmployeeData,
        { new: true }
      );
  
   
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
     
      res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
  deleteEmployeeById: async (req, res) => {
    try {
      const employeeId = req.params.id;
  
   
      const deletedEmployee = await User.findByIdAndDelete(employeeId);
  
      if (!deletedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
      res.json({
        message: "Employee deleted successfully",
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    }
  },
  
};

module.exports = employeeController;
