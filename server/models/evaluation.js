const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  SupplierName: { type: String, required: true },
  evaluationDate: { type: Date, required: true },
  QualityNote: { type: Number, required: true },
  LogisticNote: { type: Number, required: true },
  BillingError: { type: Number, required: true },
  PaymentTerm: { type: Number, required: true },
  Score: { type: Number }
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
