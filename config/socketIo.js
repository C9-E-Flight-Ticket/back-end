const { Server } = require('socket.io');
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

    io.on('connection', (socket) => {
      console.log('Client terhubung');

      // Registrasi socket untuk pengguna
      socket.on('register', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} terdaftar dengan socket ${socket.id}`);
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