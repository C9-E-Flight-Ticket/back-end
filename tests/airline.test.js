const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");
const jwt = require("jsonwebtoken");

// Mock AuthMiddleware to bypass authentication during tests
jest.mock("../middleware/authMiddleware", () => ({
  verifyAuthentication: (req, res, next) => {
    req.user = { id: 1, role: "ADMIN" }; // Mock user as admin
    next();
  },
  adminOnly: (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },
}));

describe("AirlineController", () => {
  let adminToken;

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

    // Generate token for admin
    adminToken = jwt.sign({ id: mockAdmin.id, role: mockAdmin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Mock prisma methods
    prisma.airline.findMany = jest.fn();
    prisma.airline.count = jest.fn();
    prisma.airline.create = jest.fn();
    prisma.airline.findUnique = jest.fn();
    prisma.airline.update = jest.fn();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("GET /api/admin/airline/get", () => {
    it("should get a list of airlines", async () => {
      const mockAirlines = [
        {
          id: 1,
          name: "Airline 1",
          code: "A1",
          baggage: 20,
          cabinBaggage: 7,
          entertainment: "In Flight Entertainment",
          urlImage: "http://example.com/image1.jpg",
          fileId: "file1",
        },
        {
          id: 2,
          name: "Airline 2",
          code: "A2",
          baggage: 20,
          cabinBaggage: 7,
          entertainment: "In Flight Entertainment",
          urlImage: "http://example.com/image2.jpg",
          fileId: "file2",
        },
      ];

      prisma.airline.findMany.mockResolvedValue(mockAirlines);
      prisma.airline.count.mockResolvedValue(mockAirlines.length);

      const response = await request(app)
        .get("/api/admin/airline/get")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockAirlines);
      expect(response.body.pagination.totalItems).toBe(mockAirlines.length);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.pageSize).toBe("10");
      expect(response.body.pagination.totalPages).toBe(1);
    });

    it("should return 404 if no airlines found", async () => {
      prisma.airline.findMany.mockResolvedValue([]);
      prisma.airline.count.mockResolvedValue(0);

      const response = await request(app)
        .get("/api/admin/airline/get")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(404);
      expect(response.body.payload.message).toBe("Airline tidak ditemukan");
    });

    it("should search airlines by code", async () => {
      const mockAirlines = [
        {
          id: 1,
          name: "Airline 1",
          code: "A1",
          baggage: 20,
          cabinBaggage: 7,
          entertainment: "In Flight Entertainment",
          urlImage: "http://example.com/image1.jpg",
          fileId: "file1",
        },
      ];

      prisma.airline.findMany.mockResolvedValue(mockAirlines);
      prisma.airline.count.mockResolvedValue(mockAirlines.length);

      const response = await request(app)
        .get("/api/admin/airline/get")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ search: "A1", limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockAirlines);
      expect(response.body.pagination.totalItems).toBe(mockAirlines.length);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.pageSize).toBe("10");
      expect(response.body.pagination.totalPages).toBe(1);
    });
  });

  describe("POST /api/admin/airline/create", () => {
    it("should create a new airline", async () => {
      const newAirline = {
        id: 3,
        name: "Airline 3",
        code: "A3",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: "In Flight Entertainment",
        urlImage: "http://example.com/image3.jpg",
        fileId: "file3",
      };

      prisma.airline.create.mockResolvedValue(newAirline);

      const response = await request(app)
        .post("/api/admin/airline/create")
        .send({
          name: "Airline 3",
          code: "A3",
          baggage: 20,
          cabinBaggage: 7,
          entertainment: "In Flight Entertainment",
          urlImage: "http://example.com/image3.jpg",
          fileId: "file3",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(newAirline);
    });
  });

  describe("PUT /api/admin/airline/update/:id", () => {
    it("should update an existing airline", async () => {
      const updatedAirline = {
        id: 1,
        name: "Updated Airline",
        code: "UA",
        baggage: 25,
        cabinBaggage: 10,
        entertainment: "Updated Entertainment",
        urlImage: "http://example.com/updated_image.jpg",
        fileId: "updated_file",
      };

      prisma.airline.findUnique.mockResolvedValue(updatedAirline);
      prisma.airline.update.mockResolvedValue(updatedAirline);

      const response = await request(app)
        .put("/api/admin/airline/update/1")
        .send({
          name: "Updated Airline",
          code: "UA",
          baggage: 25,
          cabinBaggage: 10,
          entertainment: "Updated Entertainment",
          urlImage: "http://example.com/updated_image.jpg",
          fileId: "updated_file",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(updatedAirline);
    });
  });

  describe("DELETE /api/admin/airline/delete/:id", () => {
    it("should delete an existing airline", async () => {
      const deletedAirline = {
        id: 1,
        name: "Deleted Airline",
        code: "DA",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: "In Flight Entertainment",
        urlImage: "http://example.com/deleted_image.jpg",
        fileId: "deleted_file",
        deleteAt: new Date(),
      };
  
      prisma.airline.findUnique.mockResolvedValue(deletedAirline);
      prisma.airline.update.mockResolvedValue(deletedAirline);
  
      const response = await request(app)
        .delete("/api/admin/airline/delete/1")
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
  
      // Convert deleteAt to string for comparison
      const expectedResponse = {
        ...deletedAirline,
        deleteAt: deletedAirline.deleteAt.toISOString(),
      };
  
      expect(response.body.payload.data).toEqual(expectedResponse);
    });
  });
});