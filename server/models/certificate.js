const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  SupplierName: { type: String},
  CertificateName: { type: String},
  CertificateNumber: { type: String,},
  ExpireDate: { type: Date },
  RecertificateDate: { type: Date },
  CertificateFile: { type: String },
  notificationStatus: { type: String, default: 'pending' }, // Pending, Sent
  lastNotifiedDate: { type: Date }, // Date when the last notification was sent

});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;