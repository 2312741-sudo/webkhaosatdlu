const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles('STAFF', 'ADMIN'));

router.get('/history', reportController.getSurveyHistory);
router.get('/:surveyId/excel', reportController.exportExcel);
router.get('/:surveyId/pdf', reportController.exportPdf);

module.exports = router;
