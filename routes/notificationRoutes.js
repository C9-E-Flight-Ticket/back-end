// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const NotificationController = require('../controllers/notificationController');
const AuthMiddleware = require('../middleware/authMiddleware');

router.use(AuthMiddleware.verifyAuthentication);

router.get('/', asyncErrorHandler(NotificationController.getPersonalAndBroadcastNotifications));
router.patch('/:id/read', asyncErrorHandler(NotificationController.markAsReadByUser));

module.exports = router;
