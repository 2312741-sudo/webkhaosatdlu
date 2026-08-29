const surveyService = require('../services/surveyService');

class SurveyController {
  async getSurveys(req, res, next) {
    try {
      const surveys = await surveyService.getSurveysForManagement(req.user, req.query);
      res.status(200).json({ success: true, data: surveys });
    } catch (error) {
      next(error);
    }
  }

  async getSurveyDetail(req, res, next) {
    try {
      const survey = await surveyService.getSurveyDetail(Number(req.params.id), req.user);
      res.status(200).json({ success: true, data: survey });
    } catch (error) {
      next(error);
    }
  }

  async createSurvey(req, res, next) {
    try {
      const survey = await surveyService.createSurvey(req.body, req.user);
      res.status(201).json({ success: true, message: 'Tạo phiếu khảo sát thành công!', data: survey });
    } catch (error) {
      next(error);
    }
  }

  async updateSurvey(req, res, next) {
    try {
      const survey = await surveyService.updateSurvey(Number(req.params.id), req.body, req.user);
      res.status(200).json({ success: true, message: 'Cập nhật khảo sát thành công!', data: survey });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const result = await surveyService.updateSurveyStatus(Number(req.params.id), req.body.status, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteSurvey(req, res, next) {
    try {
      const result = await surveyService.deleteSurvey(Number(req.params.id), req.user);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async duplicateSurvey(req, res, next) {
    try {
      const survey = await surveyService.duplicateSurvey(Number(req.params.id), req.user);
      res.status(201).json({ success: true, message: 'Nhân bản khảo sát thành công!', data: survey });
    } catch (error) {
      next(error);
    }
  }

  async getFaculties(req, res, next) {
    try {
      const faculties = await surveyService.getFaculties();
      res.status(200).json({ success: true, data: faculties });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SurveyController();
