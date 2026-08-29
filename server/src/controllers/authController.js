const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { identifier, password, fullName } = req.body;
      const result = await authService.login(identifier, password, fullName);
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async loginWithGoogle(req, res, next) {
    try {
      const { email, fullName, credential } = req.body;
      const result = await authService.loginWithDluGoogle(email, fullName, credential);
      res.status(200).json({
        success: true,
        message: 'Đăng nhập Google Workspace DLU thành công!',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await authService.updateProfile(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
