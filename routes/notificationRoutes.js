// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const NotificationController = require('../controllers/notificationController');


router.get('/', asyncErrorHandler(NotificationController.getNotifications));
router.patch('/:id/read', asyncErrorHandler(NotificationController.markAsRead));
module.exports = router;
