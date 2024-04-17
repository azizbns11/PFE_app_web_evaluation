const express = require("express");
const router = express.Router();
const evaluationController = require("../controllers/evaluationController");



router.get("/", evaluationController.getAllEvaluations);
router.post("/", evaluationController.createEvaluation);
router.get("/supplierNamesAndScores", evaluationController.getSupplierNamesAndScores);
router.get("/:id", evaluationController.getEvaluationById);
router.get("/supplier/:id", evaluationController.getEvaluationBySupplierId);
router.put("/:id", evaluationController.updateEvaluation);

module.exports = router;
