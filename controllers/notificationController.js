// controllers/notificationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require('../utils/response');
const { AppError } = require("../middleware/errorMiddleware");

class NotificationController {
 
  static async getNotifications(req, res, next) {
    try {
      const userId = parseInt(req.query.userId, 10); // Mengambil userId dari query parameter
      if (!userId) {
        return next (new AppError("userId diperlukan", 400));
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return response(200, "success", notifications, "Notifikasi berhasil diambil", res);
    } catch (error) {
      next(error);
    }
  }


  static async markAsRead(req, res, next) {
    const notificationId = parseInt(req.params.id, 10);
    const userId = parseInt(req.query.userId, 10);

    if (!userId) {
      return next(new AppError("userId diperlukan", 400));
    }

    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
        },
      });

      if (notification.count === 0) {
        return next(new AppError("Notifikasi tidak ditemukan", 404));
      }

      return response(200, "success", null, "Notifikasi berhasil ditandai sebagai sudah dibaca", res);
    } catch (error) {
      next(error);
    }
  }

}

module.exports = NotificationController;
