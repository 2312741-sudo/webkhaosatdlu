const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Lấy danh sách khảo sát cho sinh viên
router.get('/student/surveys', authenticateToken, responseController.getStudentSurveys);

// Lấy chi tiết khảo sát để trả lời (có thể qua Token QR hoặc ID)
router.get('/take/:identifier', authenticateToken, responseController.getSurveyForAnswering);

// Nộp câu trả lời khảo sát
router.post('/take/:surveyId/submit', authenticateToken, responseController.submitResponse);

module.exports = router;
