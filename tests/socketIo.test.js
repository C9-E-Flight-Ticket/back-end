const { Server } = require('http');
const { io: Client } = require('socket.io-client');
const socketModule = require('../config/socketIo');
const prisma = require('../models/prismaClients');

jest.mock('../models/prismaClients');

describe('Socket.IO Integration Tests', () => {
  let server;
  let clientSocket;

  beforeAll((done) => {
    server = new Server();
    socketModule.init(server);

    server.listen(() => {
      const port = server.address().port;
      clientSocket = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        reconnection: false,
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    server.close();
  });

  test('should register a user and send broadcast notifications', (done) => {
    const mockNotifications = [
      { title: 'Test 1', message: 'Message 1', createdAt: new Date() },
      { title: 'Test 2', message: 'Message 2', createdAt: new Date() },
    ];

    prisma.notification.findMany.mockResolvedValue(mockNotifications);

    clientSocket.emit('register', 'user1');

    const handleNotification = (notification) => {
      expect(mockNotifications).toContainEqual(
        expect.objectContaining({
          title: notification.title,
          message: notification.message,
        })
      );
      clientSocket.off('broadcast-notification', handleNotification);
      done();
    };

    clientSocket.on('broadcast-notification', handleNotification);
  });

  test('should remove user socket on disconnect', (done) => {
    clientSocket.emit('register', 'user1');

    clientSocket.on('disconnect', () => {
      setTimeout(() => {
        expect(socketModule.getUserSocket('user1')).toBeUndefined();
        done();
      }, 100); // Beri waktu untuk memastikan socket dihapus
    });

    clientSocket.disconnect();
  });

  test('should get the online user sockets', () => {
    socketModule.getUserSocket('user2'); // Assume this was registered in previous tests.
    const sockets = socketModule.getOnlineUserSockets();
    expect(sockets).toBeInstanceOf(Array);
  });
});