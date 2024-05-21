const ExcelJS = require('exceljs');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');
const Certificate = require('../models/certificate');
const Protocol = require('../models/protocol');

module.exports = {
  GetExport: async (req, res) => {
    try {
    
      const workbook = new ExcelJS.Workbook();
      
  
      const supplierSheet = workbook.addWorksheet('Suppliers');
      supplierSheet.columns = [
        { header: 'Supplier Name', key: 'groupName' },
      ];

      const evaluationSheet = workbook.addWorksheet('Evaluations');
      evaluationSheet.columns = [
        { header: 'Supplier Name', key: 'SupplierName' },
        { header: 'Evaluation Date', key: 'evaluationDate' },
        { header: 'Quality Note', key: 'QualityNote' },
        { header: 'Logistic Note', key: 'LogisticNote' },
        { header: 'Billing Error', key: 'BillingError' },
        { header: 'Payment Term', key: 'PaymentTerm' },
        { header: 'Score', key: 'Score' },

      ];

  
      const certificateSheet = workbook.addWorksheet('Certificates');
      certificateSheet.columns = [
        { header: 'Supplier Name', key: 'SupplierName' },
        { header: 'Certificate Name', key: 'CertificateName' },
        { header: 'Certificate Number', key: 'CertificateNumber' },
     
  
      ];

   
      const protocolSheet = workbook.addWorksheet('Protocols');
      protocolSheet.columns = [
        { header: 'Supplier Name', key: 'supplierName' },
        { header: 'protocol Title', key: 'protocolTitle' },
        { header: 'Protocol Status', key: 'status' },
  
      ];

 
      const suppliers = await User.find({ role: 'supplier' });
      supplierSheet.addRows(suppliers.map(supplier => ({ groupName: supplier.groupName })));

   
      for (const supplier of suppliers) {
      
        const evaluations = await Evaluation.find({ supplierId: supplier._id });

     
        evaluationSheet.addRows(evaluations.map(evaluation => ({
          SupplierName: supplier.groupName,
          evaluationDate: evaluation.evaluationDate,
          QualityNote: evaluation.QualityNote,
          LogisticNote: evaluation.LogisticNote,
          BillingError: evaluation.BillingError,
          PaymentTerm: evaluation.PaymentTerm,
          Score: evaluation.Score,
       
        })));
      }

    
      const certificates = await Certificate.find();
      certificateSheet.addRows(certificates.map(certificate => ({
        SupplierName: certificate.SupplierName,
        CertificateName: certificate.CertificateName,
        CertificateNumber: certificate.CertificateNumber,
      })));

   
      const protocols = await Protocol.find();
      protocolSheet.addRows(protocols.map(protocol => ({
        supplierName: protocol.supplierName,
        protocolTitle:protocol.protocolTitle,
        status: protocol.status,
        
      })));

    
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');

 
      await workbook.xlsx.write(res);
      
    
      res.end();
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
};
