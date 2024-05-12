const Evaluation = require('../models/evaluation');
const User = require('../models/user');
const dashboardController = {
  getTopSuppliers: async (req, res) => {
    try {
        console.log("Fetching top suppliers for the current month...");
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const topSuppliers = await Evaluation.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$evaluationDate" }, currentMonth] },
                            { $eq: [{ $year: "$evaluationDate" }, currentYear] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$supplierId",
                    avgScore: { $avg: "$Score" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "supplier"
                }
            },
            {
                $unwind: "$supplier"
            },
            {
                $match: {
                    "avgScore": { $gt: 85 }
                }
            },
            {
                $sort: { avgScore: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    SupplierName: "$supplier.groupName", 
                    avgScore: 1
                }
            }
        ]);

        console.log("Top suppliers fetched successfully:", topSuppliers);
        res.json(topSuppliers);
    } catch (error) {
        console.error('Error fetching top suppliers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}
,
  
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
