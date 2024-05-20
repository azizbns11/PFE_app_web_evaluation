const Evaluation = require('../models/evaluation');
const User = require('../models/user');
const sendNotification = require('../utils/Notification');
const Notification = require('../models/notification');
const moment = require('moment');
const { getIo } = require("../SocketIo");
exports. createEvaluation = async (req, res) => {
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

    if (!SupplierName || !evaluationDate || !QualityNote || !LogisticNote || !BillingError || !PaymentTerm || !Score) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const parsedEvaluationDate = new Date(evaluationDate);

    const supplier = await User.findOne({ groupName: SupplierName });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const january2024 = new Date('2024-01-01');
    const currentMonth = new Date();
    if (parsedEvaluationDate < january2024) {
      return res.status(400).json({ message: 'Evaluation cannot be added for months before January 2024' });
    }

    // Check if the previous month's evaluation exists
    if (parsedEvaluationDate.getMonth() !== 0) { // Exclude January 2024
      const previousMonthStart = moment(parsedEvaluationDate).subtract(1, 'months').startOf('month').toDate();
      const previousMonthEnd = moment(parsedEvaluationDate).subtract(1, 'months').endOf('month').toDate();

      const previousMonthEvaluation = await Evaluation.findOne({
        SupplierName,
        evaluationDate: { $gte: previousMonthStart, $lte: previousMonthEnd }
      });

  
      if (!previousMonthEvaluation) {
        return res.status(400).json({ message: 'An evaluation for the previous month is required before adding a new evaluation for the current month' });
      }
    }

  
    const evaluation = new Evaluation({
      SupplierName,
      supplierId: supplier._id, 
      evaluationDate: parsedEvaluationDate, 
      QualityNote,
      LogisticNote,
      BillingError,
      PaymentTerm,
      Score
    });
    await evaluation.save();

    const notification = new Notification({
      userId: supplier._id,
      message: 'You have a new evaluation',
      type: 'evaluation',
    });
    await notification.save();

 
    const io = getIo();
    io.emit("newEvaluation", { userRole: supplier.role, supplierId: supplier._id });

  
    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};



exports.getAllEvaluations = async (req, res) => {
  try {
    const userId = req.userId; 
    const userRole = req.userRole; 

    let evaluations = [];

  
    if (userRole === 'supplier') {
      evaluations = await Evaluation.find({ supplierId: userId });
    } else {
     
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
    const userId = req.userId; 
    const userRole = req.userRole; 

    let evaluations = [];

   
    if (userRole === 'supplier') {
      evaluations = await Evaluation.find({ supplierId: userId }, 'SupplierName evaluationDate Score');
    } else {
   
      evaluations = await Evaluation.find({}, 'SupplierName evaluationDate Score');
    }


    const aggregatedData = {};
    evaluations.forEach(evaluation => {
      const date = evaluation.evaluationDate.toISOString().split('T')[0]; 
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
    

    const updatedEvaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      {
        QualityNote,
        LogisticNote,
        BillingError,
        PaymentTerm,
        Score
      },
      { new: true } 
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

