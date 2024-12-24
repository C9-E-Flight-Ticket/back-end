const request = require('supertest');
const { createServer } = require('http');

// Mock Prisma client
jest.mock('../models/prismaClients', () => ({
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
  },
}));

// Mock Socket.IO
jest.mock('../config/socketIo', () => {
  const mockIo = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };
  
  return {
    init: jest.fn(() => mockIo),
    getIO: jest.fn(() => mockIo),
    getUserSocket: jest.fn(),
    getOnlineUserSockets: jest.fn(),
  };
});

// Import dependencies after mocking
const prisma = require('../models/prismaClients');
const socketIo = require('../config/socketIo');
const { app } = require('../app');

// Suppress console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Notification Controller Tests', () => {
  let mockUser;
  let mockAdmin;
  let httpServer;

  beforeAll(() => {
    httpServer = createServer(app);
  });

  afterAll((done) => {
    httpServer.close(done);
  });

  beforeEach(() => {
    mockUser = {
      id: 1,
      role: 'USER',
    };
    mockAdmin = {
      id: 2,
      role: 'ADMIN',
    };
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Mock authentication middleware
  const mockAuthMiddleware = jest.fn((req, res, next) => {
    req.user = mockUser;
    next();
  });

  const mockAdminAuthMiddleware = jest.fn((req, res, next) => {
    req.user = mockAdmin;
    next();
  });

  // Apply mock middleware
  app.use('/api/notification', mockAuthMiddleware);
  app.use('/api/admin/notification', mockAdminAuthMiddleware);

  describe('Admin Endpoints', () => {
    describe('POST /api/admin/notification/send-notification', () => {
      it('should send a notification to a specific user', async () => {
        const mockNotification = {
          id: 1,
          userId: 3,
          title: 'Test Notification',
          message: 'Test Message',
          createdAt: new Date(),
        };

        prisma.notification.create.mockResolvedValue(mockNotification);
        socketIo.getUserSocket.mockReturnValue('user-socket-id');

        const response = await request(app)
          .post('/api/admin/notification/send-notification')
          .send({
            userId: 3,
            title: 'Test Notification',
            message: 'Test Message',
          });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(prisma.notification.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 3,
            title: 'Test Notification',
            message: 'Test Message',
            type: 'PERSONAL',
          }),
        });
        expect(socketIo.getUserSocket).toHaveBeenCalledWith(3);
      });

      it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
          .post('/api/admin/notification/send-notification')
          .send({
            title: 'Test Notification',
            // missing userId and message
          });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/admin/notification/broadcast-notification', () => {
      it('should broadcast a notification to all users', async () => {
        const mockNotification = {
          id: 1,
          title: 'Broadcast Test',
          message: 'Broadcast Message',
          type: 'BROADCAST',
          createdAt: new Date(),
        };

        prisma.notification.create.mockResolvedValue(mockNotification);
        socketIo.getOnlineUserSockets.mockReturnValue(['socket-1', 'socket-2']);

        const response = await request(app)
          .post('/api/admin/notification/broadcast-notification')
          .send({
            title: 'Broadcast Test',
            message: 'Broadcast Message',
          });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(prisma.notification.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            title: 'Broadcast Test',
            message: 'Broadcast Message',
            type: 'BROADCAST',
          }),
        });
        expect(socketIo.getOnlineUserSockets).toHaveBeenCalled();
      });
    });

    describe('GET /api/admin/notification', () => {
      it('should get all notifications for admin', async () => {
        const mockNotifications = [
          {
            id: 1,
            title: 'Test 1',
            message: 'Message 1',
          },
          {
            id: 2,
            title: 'Test 2',
            message: 'Message 2',
          },
        ];

        prisma.notification.findMany.mockResolvedValue(mockNotifications);

        const response = await request(app)
          .get('/api/admin/notification');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockNotifications);
        expect(prisma.notification.findMany).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('DELETE /api/admin/notification/:id', () => {
      it('should delete a notification', async () => {
        prisma.notification.deleteMany.mockResolvedValue({ count: 1 });

        const response = await request(app)
          .delete('/api/admin/notification/1');

        expect(response.status).toBe(200);
        expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
          where: { id: 1 },
        });
      });

      it('should return 404 if notification not found', async () => {
        prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

        const response = await request(app)
          .delete('/api/admin/notification/999');

        expect(response.status).toBe(404);
      });
    });
  });

  describe('User Endpoints', () => {
    describe('GET /api/notification', () => {
      it('should get personal and broadcast notifications for user', async () => {
        const mockNotifications = [
          {
            id: 1,
            userId: 1,
            title: 'Personal',
            type: 'PERSONAL',
          },
          {
            id: 2,
            title: 'Broadcast',
            type: 'BROADCAST',
          },
        ];

        prisma.notification.findMany.mockResolvedValue(mockNotifications);

        const response = await request(app)
          .get('/api/notification');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockNotifications);
        expect(prisma.notification.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { userId: mockUser.id },
              { type: 'BROADCAST' },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('PATCH /api/notification/:id/read', () => {
      it('should mark a notification as read', async () => {
        prisma.notification.updateMany.mockResolvedValue({ count: 1 });

        const response = await request(app)
          .patch('/api/notification/1/read');

        expect(response.status).toBe(200);
        expect(prisma.notification.updateMany).toHaveBeenCalledWith({
          where: {
            id: 1,
            userId: mockUser.id,
          },
          data: { read: true },
        });
      });

      it('should return 404 if notification not found', async () => {
        prisma.notification.updateMany.mockResolvedValue({ count: 0 });

        const response = await request(app)
          .patch('/api/notification/999/read');

        expect(response.status).toBe(404);
      });
    });
  });
});