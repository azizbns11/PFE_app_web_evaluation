const express = require("express");
const router = express.Router();
const protocolController = require("../controllers/protocolController");

router.post("/protocols", protocolController.addProtocol);
router.get('/protocols', protocolController.getAllProtocols);

router.get("/protocols/supplier/:id", protocolController.getProtocolBySupplierId);
router.get('/protocols/:id', protocolController.getProtocolById);
router.put('/protocols/:id', protocolController.updateProtocolById);
router.get('/file/:filename', protocolController.getProtocolFile);
router.delete('/protocols/:id', protocolController.deleteProtocolById);
module.exports = router;
