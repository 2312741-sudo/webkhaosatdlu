const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getSurveyAnalytics(req, res, next) {
    try {
      const surveyId = Number(req.params.surveyId);
      const filters = {
        className: req.query.class_name,
        academicYear: req.query.academic_year,
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to
      };
      const data = await analyticsService.getSurveyAnalytics(surveyId, filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
