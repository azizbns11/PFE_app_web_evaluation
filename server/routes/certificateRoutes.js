const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');


router.post('/certificates', certificateController.addCertificate);

router.get('/certificates', certificateController.getAllCertificates);


router.get('/certificates/:id', certificateController.getCertificateById);

router.get('/file/:filename', certificateController.getCertificateFile);

router.put('/certificates/:id', certificateController.updateCertificateById);
router.delete('/certificates/:id', certificateController.deleteCertificateById);
router.get('/certificates/supplier/:id', certificateController.getCertificateBySupplierId);
module.exports = router;



