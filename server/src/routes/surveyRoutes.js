const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const questionController = require('../controllers/questionController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Public / Authenticated common routes
router.get('/faculties', surveyController.getFaculties);

// Cán bộ & Quản trị viên quản lý khảo sát
router.use(authenticateToken);
router.get('/', authorizeRoles('STAFF', 'ADMIN'), surveyController.getSurveys);
router.get('/:id', authorizeRoles('STAFF', 'ADMIN'), surveyController.getSurveyDetail);
router.post('/', authorizeRoles('STAFF', 'ADMIN'), surveyController.createSurvey);
router.put('/:id', authorizeRoles('STAFF', 'ADMIN'), surveyController.updateSurvey);
router.patch('/:id/status', authorizeRoles('STAFF', 'ADMIN'), surveyController.updateStatus);
router.delete('/:id', authorizeRoles('STAFF', 'ADMIN'), surveyController.deleteSurvey);
router.post('/:id/duplicate', authorizeRoles('STAFF', 'ADMIN'), surveyController.duplicateSurvey);

// Quản lý câu hỏi trong khảo sát
router.get('/:surveyId/questions', authorizeRoles('STAFF', 'ADMIN'), questionController.getQuestions);
router.post('/:surveyId/questions', authorizeRoles('STAFF', 'ADMIN'), questionController.createQuestion);
router.put('/questions/:id', authorizeRoles('STAFF', 'ADMIN'), questionController.updateQuestion);
router.delete('/questions/:id', authorizeRoles('STAFF', 'ADMIN'), questionController.deleteQuestion);
router.post('/:surveyId/questions/reorder', authorizeRoles('STAFF', 'ADMIN'), questionController.reorderQuestions);

module.exports = router;
