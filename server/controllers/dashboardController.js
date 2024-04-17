const Evaluation = require('../models/evaluation');
const User = require('../models/user');
const dashboardController = {
    getTopSuppliers : async (req, res) => {
        try {
          console.log("Fetching top suppliers...");
          const topSuppliers = await Evaluation.find({ Score: { $gt: 85 } }).sort({ Score: -1 }).limit(10);
          console.log("Top suppliers fetched successfully:", topSuppliers);
          res.json(topSuppliers);
        } catch (error) {
          console.error('Error fetching top suppliers:', error);
          res.status(500).json({ message: 'Server Error' });
        }
      },
      getTotalSuppliers: async (req, res) => {
        try {
          const totalSuppliers = await User.countDocuments({ role: "supplier" });
          res.json({ totalSuppliers });
        } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: "Server Error" });
        }
      },
      getTotalEmployees: async (req, res) => {
        try {
          const totalEmployees = await User.countDocuments({ role: "employee" });
          res.json({ totalEmployees });
        } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: "Server Error" });
        }
      },
  
   
    };
module.exports = dashboardController;
