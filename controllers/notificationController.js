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

  static async createNotification(req, res, next) {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return next(new AppError("userId, title, and message are required", 400));
    }

    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message
        },
      });

      return response(201, "success", notification, "Notification created successfully", res);
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req, res, next) {
    try {
      const userId = parseInt(req.query.userId, 10);

      if (!userId) {
        return next(new AppError("userId is required", 400));
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return response(200, "success", notifications, "Notifications fetched successfully", res);
    } catch (error) {
      next(error);
    }
  }

  static async createMany(req, res, next) {
    try {
      const titles = Object.keys(Title).map(key => ({ key, value: Title[key] }));

      return response(200, "success", { titles }, "Create many options fetched", res);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    const notificationId = parseInt(req.params.id, 10);
    const userId = parseInt(req.query.userId, 10);

    if (!userId) {
      return next(new AppError("userId is required", 400));
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
        return next(new AppError("Notification not found", 404));
      }

      return response(200, "success", null, "Notification marked as read", res);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req, res, next) {
    const notificationId = parseInt(req.params.id, 10);
    const userId = parseInt(req.query.userId, 10);

    if (!userId) {
      return next(new AppError("userId is required", 400));
    }

    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (notification.count === 0) {
        return next(new AppError("Notification not found", 404));
      }

      return response(200, "success", null, "Notification deleted successfully", res);
    } catch (error) {
      next(error);
    }
  } 
}

module.exports = NotificationController;
