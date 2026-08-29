const responseService = require('../services/responseService');

class ResponseController {
  async getStudentSurveys(req, res, next) {
    try {
      const surveys = await responseService.getStudentSurveys(req.user);
      res.status(200).json({ success: true, data: surveys });
    } catch (error) {
      next(error);
    }
  }

  async getSurveyForAnswering(req, res, next) {
    try {
      const result = await responseService.getSurveyForAnswering(req.params.identifier, req.user || null);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submitResponse(req, res, next) {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const result = await responseService.submitSurveyResponse(
        Number(req.params.surveyId),
        req.body,
        req.user,
        ip
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResponseController();
