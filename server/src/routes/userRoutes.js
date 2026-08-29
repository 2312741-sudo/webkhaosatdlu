const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/', userController.getAllUsers);
router.get('/audit-logs', userController.getAuditLogs);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/reset-password', userController.resetPassword);
router.patch('/:id/toggle-status', userController.toggleStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
