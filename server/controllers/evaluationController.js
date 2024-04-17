const Evaluation = require('../models/evaluation');
const User = require('../models/user');
const sendNotification = require('../utils/Notification');
const Notification = require('../models/notification');
const moment = require('moment');
exports.createEvaluation = async (req, res) => {
  try {
    const {
      SupplierName,
      evaluationDate,
      QualityNote,
      LogisticNote,
      BillingError,
      PaymentTerm,
      Score
    } = req.body;

    // Ensure that all required fields are provided
    if (!SupplierName || !evaluationDate || !QualityNote || !LogisticNote || !BillingError || !PaymentTerm || !Score) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse the evaluationDate string back into a Date object
    const parsedEvaluationDate = new Date(evaluationDate);

    // Fetch the supplierId based on the selected SupplierName
    const supplier = await User.findOne({ groupName: SupplierName });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check if evaluationDate is after January 2024
    const january2024 = new Date('2024-01-01');
    const currentMonth = new Date();
    if (parsedEvaluationDate < january2024) {
      return res.status(400).json({ message: 'Evaluation cannot be added for months before January 2024' });
    }

    // Check if there is an evaluation for the previous month
    if (parsedEvaluationDate.getMonth() !== 0) { // Exclude January 2024
      const previousMonthStart = moment(parsedEvaluationDate).subtract(1, 'months').startOf('month').toDate();
      const previousMonthEnd = moment(parsedEvaluationDate).subtract(1, 'months').endOf('month').toDate();

      const previousMonthEvaluation = await Evaluation.findOne({
        SupplierName,
        evaluationDate: { $gte: previousMonthStart, $lte: previousMonthEnd }
      });

      // If there is no evaluation for the previous month, return an error
      if (!previousMonthEvaluation) {
        return res.status(400).json({ message: 'An evaluation for the previous month is required before adding a new evaluation for the current month' });
      }
    }

    // Proceed with creating the evaluation for the current month
    const evaluation = new Evaluation({
      SupplierName,
      supplierId: supplier._id, 
      evaluationDate: parsedEvaluationDate, // Use parsed date
      QualityNote,
      LogisticNote,
      BillingError,
      PaymentTerm,
      Score
    });
    await evaluation.save();

    // Create a notification for the supplier
    const notification = new Notification({
      userId: supplier._id,
      message: 'You have a new evaluation',
      type: 'evaluation',
    });
    await notification.save();

    // Trigger notification to supplier
    sendNotification(supplier.email, 'New Evaluation Added', 'New Evaluation Added','evaluation');

    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getAllEvaluations = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have the user ID extracted from the token
    const userRole = req.userRole; // Assuming you have the user's role extracted from the token

    let evaluations = [];

    // If the user is a supplier, retrieve only the evaluations associated with their supplier ID
    if (userRole === 'supplier') {
      evaluations = await Evaluation.find({ supplierId: userId });
    } else {
      // For admin or other roles, retrieve all evaluations
      evaluations = await Evaluation.find();
    }

    res.json(evaluations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getSupplierNamesAndScores = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have the user ID extracted from the token
    const userRole = req.userRole; // Assuming you have the user's role extracted from the token

    let evaluations = [];

    // If the user is a supplier, retrieve only the evaluations associated with their supplier ID
    if (userRole === 'supplier') {
      evaluations = await Evaluation.find({ supplierId: userId }, 'SupplierName evaluationDate Score');
    } else {
      // For admin or other roles, retrieve all evaluations
      evaluations = await Evaluation.find({}, 'SupplierName evaluationDate Score');
    }

    // Aggregate the data based on evaluation date
    const aggregatedData = {};
    evaluations.forEach(evaluation => {
      const date = evaluation.evaluationDate.toISOString().split('T')[0]; // Extract date without time
      if (!aggregatedData[date]) {
        aggregatedData[date] = [];
      }
      aggregatedData[date].push({
        SupplierName: evaluation.SupplierName,
        Score: evaluation.Score
      });
    });

    res.json(aggregatedData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.updateEvaluation = async (req, res) => {
  try {
    const { QualityNote, LogisticNote, BillingError, PaymentTerm, Score } = req.body;
    
    // Find the evaluation by ID
    const updatedEvaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      {
        QualityNote,
        LogisticNote,
        BillingError,
        PaymentTerm,
        Score
      },
      { new: true } // Return the updated document
    );

    if (!updatedEvaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.json({ message: 'Evaluation updated successfully', evaluation: updatedEvaluation });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json(evaluation);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getEvaluationBySupplierId = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluations = await Evaluation.find({ supplierId: id });
    res.json(evaluations);
  } catch (error) {
    console.error("Error fetching evaluation details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

