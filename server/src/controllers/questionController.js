const questionService = require('../services/questionService');

class QuestionController {
  async getQuestions(req, res, next) {
    try {
      const questions = await questionService.getQuestionsBySurvey(Number(req.params.surveyId));
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req, res, next) {
    try {
      const question = await questionService.createQuestion(Number(req.params.surveyId), req.body, req.user);
      res.status(201).json({ success: true, message: 'Thêm câu hỏi thành công!', data: question });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const question = await questionService.updateQuestion(Number(req.params.id), req.body, req.user);
      res.status(200).json({ success: true, message: 'Cập nhật câu hỏi thành công!', data: question });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      const result = await questionService.deleteQuestion(Number(req.params.id), req.user);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async reorderQuestions(req, res, next) {
    try {
      const result = await questionService.reorderQuestions(Number(req.params.surveyId), req.body.questionIds);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();
