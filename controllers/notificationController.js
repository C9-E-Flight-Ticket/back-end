// controllers/notificationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require('../utils/response');

class NotificationController {
 
  static async getNotifications(req, res) {
    try {
      const userId = parseInt(req.query.userId, 10); // Mengambil userId dari query parameter
      if (!userId) {
        return response(400, "error", null, "userId diperlukan", res);
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return response(200, "success", notifications, "Notifikasi berhasil diambil", res);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return response(500, "error", null, "Gagal mengambil notifikasi", res);
    }
  }


  static async markAsRead(req, res) {
    const notificationId = parseInt(req.params.id, 10);
    const userId = parseInt(req.query.userId, 10);

    if (!userId) {
      return response(400, "error", null, "userId diperlukan", res);
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
        return response(404, "error", null, "Notifikasi tidak ditemukan", res);
      }

      return response(200, "success", null, "Notifikasi berhasil ditandai sebagai sudah dibaca", res);
    } catch (error) {
      console.error("Error updating notification:", error);
      return response(500, "error", null, "Gagal memperbarui notifikasi", res);
    }
  }

}

module.exports = NotificationController;
