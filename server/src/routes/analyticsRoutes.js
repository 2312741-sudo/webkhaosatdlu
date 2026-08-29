const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/:surveyId', authenticateToken, authorizeRoles('STAFF', 'ADMIN'), analyticsController.getSurveyAnalytics);

module.exports = router;
