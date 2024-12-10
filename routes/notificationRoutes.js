// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const NotificationController = require('../controllers/notificationController');


router.post('/createNotification', asyncErrorHandler(NotificationController.createNotification));
router.get('/', asyncErrorHandler(NotificationController.getNotifications));
router.get('/createMany', asyncErrorHandler(NotificationController.createMany));
router.patch('/:id/read', asyncErrorHandler(NotificationController.markAsRead));
router.delete('/:id', asyncErrorHandler(NotificationController.deleteNotification));

module.exports = router;