const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  SupplierName: { type: String, required: true },
  CertificateName: { type: String, required: true },
  CertificateNumber: { type: String, required: true },
  ExpireDate: { type: Date , required: true },
  RecertificateDate: { type: Date , required: true },
  CertificateFile: { type: String , required: true },
  notificationStatus: { type: String, default: 'pending' },
  lastNotifiedDate: { type: Date }, 

});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;