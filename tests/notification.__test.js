const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");
const bcrypt = require("bcrypt");
const { sendOtp } = require("../utils/otp");

jest.mock("../utils/otp");

// Mock AuthMiddleware to bypass authentication during tests
jest.mock("../middleware/authMiddleware", () => ({
  verifyAuthentication: (req, res, next) => {
    if (req.headers.authorization === "Bearer valid-admin-token") {
      req.user = { id: 1, role: "ADMIN" }; // Mock user as admin
    } else if (req.headers.authorization === "Bearer valid-user-token") {
      req.user = { id: 2, role: "USER" }; // Mock user as user
    }
    next();
  },
  adminOnly: (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },
}));

describe("NotificationController", () => {
  let adminToken = "valid-admin-token";
  let userToken = "valid-user-token";

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock bcrypt to always return true for password comparison
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    // Create mock admin user
    const mockAdmin = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedpassword",
      role: "ADMIN",
      is_verified: true,
    };

    // Create mock regular user
    const mockUser = {
      id: 2,
      name: "Regular User",
      email: "user@example.com",
      password: "hashedpassword",
      role: "USER",
      is_verified: true,
    };

    prisma.user.findUnique = jest.fn().mockImplementation(({ where }) => {
      if (where.email === mockAdmin.email) return mockAdmin;
      if (where.email === mockUser.email) return mockUser;
      return null;
    });

    // Mock token generation
    jest.mock("../middleware/authMiddleware", () => ({
      generateToken: (user) => {
        if (user.role === "ADMIN") return "valid-admin-token";
        if (user.role === "USER") return "valid-user-token";
        return null;
      },
    }));
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("POST /api/admin/notification/send-notification", () => {
    const endpoint = "/api/admin/notification/send-notification";

    it("should send notification to a specific user", async () => {
      const mockUser = {
        id: 2,
        name: "Jane Doe",
        email: "jane@example.com",
      };

      const mockNotification = {
        id: 1,
        userId: mockUser.id,
        title: "Test Notification",
        message: "This is a test notification",
        senderId: 1,
        type: "PERSONAL",
        createdAt: new Date(),
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prisma.notification.create = jest.fn().mockResolvedValue(mockNotification);

      const response = await request(app)
        .post(endpoint)
        .send({
          userId: mockUser.id,
          title: "Test Notification",
          message: "This is a test notification",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notification sent successfully");
      expect(response.body.payload.data).toEqual(mockNotification);
    });
  });

  describe("POST /api/admin/notification/broadcast-notification", () => {
    const endpoint = "/api/admin/notification/broadcast-notification";

    it("should broadcast notification to all users", async () => {
      const mockNotification = {
        id: 1,
        title: "Broadcast Notification",
        message: "This is a broadcast notification",
        senderId: 1,
        type: "BROADCAST",
        createdAt: new Date(),
      };

      prisma.notification.create = jest.fn().mockResolvedValue(mockNotification);

      const response = await request(app)
        .post(endpoint)
        .send({
          title: "Broadcast Notification",
          message: "This is a broadcast notification",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Broadcast notification sent successfully");
      expect(response.body.payload.data).toEqual(mockNotification);
    });
  });

  describe("GET /api/admin/notification", () => {
    const endpoint = "/api/admin/notification";

    it("should get all notifications for admin", async () => {
      const mockNotifications = [
        {
          id: 1,
          title: "Notification 1",
          message: "This is notification 1",
          senderId: 1,
          type: "PERSONAL",
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Notification 2",
          message: "This is notification 2",
          senderId: 1,
          type: "BROADCAST",
          createdAt: new Date(),
        },
      ];

      prisma.notification.findMany = jest.fn().mockResolvedValue(mockNotifications);

      const response = await request(app)
        .get(endpoint)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notifications fetched successfully");
      expect(response.body.payload.data).toEqual(mockNotifications);
    });
  });

  describe("DELETE /api/admin/notification/:id", () => {
    const endpoint = "/api/admin/notification/1";

    it("should delete a notification for admin", async () => {
      prisma.notification.deleteMany = jest.fn().mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete(endpoint)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notification deleted successfully");
    });

    it("should return 404 if notification not found", async () => {
      prisma.notification.deleteMany = jest.fn().mockResolvedValue({ count: 0 });

      const response = await request(app)
        .delete(endpoint)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.message).toBe("Notification not found");
    });
  });

  describe("GET /api/notification", () => {
    const endpoint = "/api/notification";

    it("should get personal and broadcast notifications for user", async () => {
      const mockNotifications = [
        {
          id: 1,
          title: "Personal Notification",
          message: "This is a personal notification",
          userId: 2,
          type: "PERSONAL",
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Broadcast Notification",
          message: "This is a broadcast notification",
          type: "BROADCAST",
          createdAt: new Date(),
        },
      ];

      prisma.notification.findMany = jest.fn().mockResolvedValue(mockNotifications);

      const response = await request(app)
        .get(endpoint)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notifications fetched successfully");
      expect(response.body.payload.data).toEqual(mockNotifications);
    });
  });

  describe("PATCH /api/notification/:id/read", () => {
    const endpoint = "/api/notification/1/read";

    it("should mark notification as read by user", async () => {
      prisma.notification.updateMany = jest.fn().mockResolvedValue({ count: 1 });

      const response = await request(app)
        .patch(endpoint)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notification marked as read successfully");
    });

    it("should return 404 if notification not found", async () => {
      prisma.notification.updateMany = jest.fn().mockResolvedValue({ count: 0 });

      const response = await request(app)
        .patch(endpoint)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.message).toBe("Notification not found");
    });
  });
});