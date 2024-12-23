const { Server } = require('socket.io');
const prisma = require('../models/prismaClients'); 
let io;
const userSockets = new Map();

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL,
          ], 
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', async (socket) => {
      console.log('Client terhubung');

      // Registrasi socket untuk pengguna
      socket.on('register', async (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} terdaftar dengan socket ${socket.id}`);

        // Kirim notifikasi broadcast yang belum diterima ke pengguna baru
        const broadcasts = await prisma.notification.findMany({
          where: {
            type: 'BROADCAST'
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        broadcasts.forEach((notification) => {
          io.to(socket.id).emit('broadcast-notification', {
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
          });
        });
      });

      socket.on('disconnect', () => {
        // Hapus mapping socket saat terputus
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            break;
          }
        }
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO belum diinisialisasi');
    }
    return io;
  },

  getUserSocket: (userId) => {
    return userSockets.get(userId);
  },

  getOnlineUserSockets: () => {
    return Array.from(userSockets.values());
  }
};