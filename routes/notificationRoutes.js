// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');


router.get('/', NotificationController.getNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
module.exports = router;
