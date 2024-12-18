// controllers/notificationController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const { AppError } = require("../middleware/errorMiddleware");
const socketIoInstance = require("../config/socketIo");

class NotificationController {
  // Metode baru untuk mengirim notifikasi ke pengguna tertentu
  static async sendNotificationToUser(req, res, next) {
    const { userId, title, message } = req.body;
    const senderId = req.user.id; // ID admin yang mengirim

    if (!userId || !title || !message) {
      return next(new AppError("userId, title, and message are required", 400));
    }

    try {
      // Buat notifikasi di database
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          senderId,
          type: "PERSONAL",
        },
      });

      // Kirim notifikasi real-time menggunakan Socket.IO
      const io = socketIoInstance.getIO();
      const userSocket = socketIoInstance.getUserSocket(userId);

      if (userSocket) {
        io.to(userSocket).emit("personal-notification", {
          id: notification.id,
          title,
          message,
          createdAt: notification.createdAt,
        });
      }

      return response(
        201,
        "success",
        notification,
        "Notification sent successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  // Metode untuk mengirim notifikasi ke semua pengguna
  static async broadcastNotificationToAllUsers(req, res, next) {
    const { title, message } = req.body;
    const senderId = req.user.id; // ID admin yang mengirim

    if (!title || !message) {
      return next(new AppError("title and message are required", 400));
    }

    try {
      // Ambil semua user
      const users = await prisma.user.findMany();

      // Buat batch notifikasi
      const notifications = await Promise.all(
        users.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              title,
              message,
              senderId,
              type: "BROADCAST",
            },
          })
        )
      );

      // Kirim notifikasi real-time ke semua pengguna yang online
      const io = socketIoInstance.getIO();
      const onlineUserSockets = socketIoInstance.getOnlineUserSockets();

      onlineUserSockets.forEach((socketId) => {
        io.to(socketId).emit("broadcast-notification", {
          title,
          message,
          createdAt: new Date(),
        });
      });

      return response(
        201,
        "success",
        notifications,
        "Broadcast notification sent successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  // metode untuk melihat seluruh notifikasi untuk admin
  static async getAllNotificationsForAdmin(req, res, next) {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
      });

      return response(
        200,
        "success",
        notifications,
        "Notifications fetched successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  // metode untuk menghapus notifikasi untuk admin
  static async deleteNotificationForAdmin(req, res, next) {
    const notificationId = parseInt(req.params.id, 10);

    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
        },
      });

      if (notification.count === 0) {
        return next(new AppError("Notification not found", 404));
      }

      return response(
        200,
        "success",
        null,
        "Notification deleted successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  // USER

  // metode untuk menampilkan sesuai id user yang login && notification broadcast, ini untuk di menu notification user
  static async getPersonalAndBroadcastNotifications(req, res, next) {
    const userId = req.user.id;

    if (!userId) {
      return next(new AppError("userId is required", 400));
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: {
          OR: [{ userId }, { type: "BROADCAST" }],
        },
        orderBy: { createdAt: "desc" },
      });

      return response(
        200,
        "success",
        notifications,
        "Notifications fetched successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  // metode untuk mengubah status notifikasi yang diklik user menjadi sudah dibaca oleh user
  static async markAsReadByUser(req, res, next) {
    const notificationId = parseInt(req.params.id, 10);
    const userId = req.user.id;

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

      return response(
        200,
        "success",
        null,
        "Notification marked as read successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
