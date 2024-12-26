const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");
const jwt = require("jsonwebtoken");

jest.mock("../middleware/authMiddleware", () => ({
  verifyAuthentication: (req, res, next) => {
    req.user =
      req.headers["role"] === "USER"
        ? { id: 2, role: "USER" }
        : { id: 1, role: "ADMIN" }; // Mock user based on role header
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
  let adminToken;
  let userToken;
  let notificationId;

  beforeAll(async () => {
    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = "your_secret_key";

    // Create mock admin user
    const mockAdmin = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    };

    // Create mock user
    const mockUser = {
      id: 2,
      name: "User",
      email: "user@example.com",
      role: "USER",
    };

    // Generate token for admin
    adminToken = jwt.sign(
      { id: mockAdmin.id, role: mockAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Generate token for user
    userToken = jwt.sign(
      { id: mockUser.id, role: mockUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Mock prisma methods
    prisma.notification.findMany = jest.fn();
    prisma.notification.count = jest.fn();
    prisma.notification.create = jest.fn();
    prisma.notification.findUnique = jest.fn();
    prisma.notification.update = jest.fn();
    prisma.notification.deleteMany = jest.fn();
    prisma.notification.updateMany = jest.fn();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  // Testing /api/admin/notification/send-notification for send notification to a specific user
  describe("POST /api/admin/notification/send-notification", () => {
    it("should send a notification to a specific user", async () => {
      const mockNotification = {
        id: 1,
        userId: 2,
        title: "Test Notification",
        message: "This is a test notification",
        senderId: 1,
        type: "PERSONAL",
        createdAt: new Date(),
        deleteAt: null,
        read: false,
        updateAt: new Date(),
      };

      prisma.notification.create.mockResolvedValue(mockNotification);

      const response = await request(app)
        .post("/api/admin/notification/send-notification")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: 2,
          title: "Test Notification",
          message: "This is a test notification",
        });

      notificationId = response.body.payload.data.id;

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(
        expect.objectContaining({
          userId: mockNotification.userId,
          title: mockNotification.title,
          message: mockNotification.message,
          senderId: mockNotification.senderId,
          type: mockNotification.type,
        })
      );
      expect(response.body.payload.message).toBe(
        "Notification sent successfully"
      );
    });

    it("should return 400 if userId, title, or message is missing", async () => {
      const response = await request(app)
        .post("/api/admin/notification/send-notification")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: 2,
          title: "Test Notification",
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.message).toBe(
        "userId, title, and message are required"
      );
    });

    it("should return 500 if there is an error in the server", async () => {
      prisma.notification.create.mockRejectedValue(new Error("Test error"));
      const response = await request(app)
        .post("/api/admin/notification/send-notification")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: "2",
          title: 1343,
          message: "This is a test notification",
        });
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/admin/notification/broadcast-notification", () => {
    it("should broadcast a notification to all users", async () => {
      const mockNotification = {
        id: 1,
        title: "Broadcast Notification",
        message: "This is a broadcast notification",
        senderId: 1,
        type: "BROADCAST",
        createdAt: new Date(),
      };

      prisma.notification.create.mockResolvedValue(mockNotification);

      const response = await request(app)
        .post("/api/admin/notification/broadcast-notification")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Broadcast Notification",
          message: "This is a broadcast notification",
        });

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Broadcast notification sent successfully");
    });

    it("should return 400 if title or message is missing", async () => {
      const response = await request(app)
        .post("/api/admin/notification/broadcast-notification")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Broadcast Notification",
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.message).toBe(
        "title and message are required"
      );
    });
  });

  describe("GET /api/admin/notification", () => {
    it("should get all notifications for admin", async () => {
      const mockNotifications = [
        { id: 1, title: "Notification 1", message: "Message 1", createdAt: new Date() },
        { id: 2, title: "Notification 2", message: "Message 2", createdAt: new Date() },
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const response = await request(app)
        .get("/api/admin/notification")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });

  });

  describe("GET /api/notification", () => {
    it("should get personal and broadcast notifications for user", async () => {
      const mockNotifications = [
        { id: 1, title: "Notification 1", message: "Message 1", userId: 2, type: "PERSONAL", createdAt: new Date() },
        { id: 2, title: "Notification 2", message: "Message 2", type: "BROADCAST", createdAt: new Date() },
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const response = await request(app)
        .get("/api/notification")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  });

  describe("PATCH /api/notification/:id/read", () => {
    it("should mark a notification as read for user", async () => {

      const response = await request(app)
        .patch(`/api/notification/3/read`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notification marked as read successfully");
    });

    it("should return 404 if notification not found", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const response = await request(app)
        .patch("/api/notification/999/read")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Notification not found");
    });
  });

  describe("DELETE /api/admin/notification/:id", () => {
    it("should delete a notification for admin", async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete(`/api/admin/notification/${notificationId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Notification deleted successfully");
    });

    it("should return 404 if notification not found", async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      const response = await request(app)
        .delete("/api/admin/notification/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Notification not found");
    });
  });
});
