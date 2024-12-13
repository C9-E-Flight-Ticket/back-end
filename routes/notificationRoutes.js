// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const NotificationController = require('../controllers/notificationController');
const AuthMiddleware = require('../middleware/authMiddleware');

router.use(AuthMiddleware.verifyAuthentication);

router.get('/', asyncErrorHandler(NotificationController.getNotifications));
router.patch('/:id/read', asyncErrorHandler(NotificationController.markAsRead));
router.post('/createNotification', asyncErrorHandler(NotificationController.createNotification));
router.get('/createMany', asyncErrorHandler(NotificationController.createMany));
router.delete('/:id', asyncErrorHandler(NotificationController.deleteNotification));

module.exports = router;
