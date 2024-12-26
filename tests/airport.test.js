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

describe("AirportController", () => {
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
    adminToken = jwt.sign(
      { id: mockAdmin.id, role: mockAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Mock prisma methods
    prisma.airport.create = jest.fn();
    prisma.airport.findMany = jest.fn();
    prisma.airport.findUnique = jest.fn();
    prisma.airport.update = jest.fn();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("GET /api/admin/airport", () => {
    it("should return a list of airports", async () => {
      const mockAirports = [
        { id: 1, name: "Airport A", city: "City A" },
        { id: 2, name: "Airport B", city: "City B" },
      ];

      prisma.airport.findMany.mockResolvedValue(mockAirports);

      const response = await request(app)
        .get("/api/admin/airport")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockAirports);
    });

    it("should return 500 if there is a server error", async () => {
      prisma.airport.findMany.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/admin/airport")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("GET /api/admin/airport/:id", () => {
    it("should return airport details", async () => {
      const mockAirport = { id: 1, name: "Airport A", city: "City A" };

      prisma.airport.findUnique.mockResolvedValue(mockAirport);

      const response = await request(app)
        .get("/api/admin/airport/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockAirport);
    });

    it("should return 404 if airport not found", async () => {
      prisma.airport.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/admin/airport/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Bandara tidak ditemukan.");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.airport.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/admin/airport/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("POST /api/admin/airport", () => {
    it("should create a new airport", async () => {
      const mockAirport = {
        id: 1,
        name: "Airport A",
        code: "AAA",
        city: "City A",
        terminalName: "Terminal 1A",
        terminalCategory: "Domestic",
        continent: "Asia",
        urlImage: "http://example.com/image.jpg",
        fileId: 1,
      };

      prisma.airport.create.mockResolvedValue(mockAirport);

      const response = await request(app)
        .post("/api/admin/airport")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(mockAirport);

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockAirport);
    });

    it("should return 500 if there is a server error", async () => {
      prisma.airport.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/admin/airport")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Airport A",
          code: "AAA",
          city: "City A",
          terminalName: "Terminal 1A",
          terminalCategory: "Domestic",
          continent: "Asia",
          urlImage: "http://example.com/image.jpg",
          fileId: 1,
        });

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("PUT /api/admin/airport/:id", () => {
    it("should update airport details", async () => {
      const mockAirport = {
        id: 1,
        name: "Airport A",
        code: "AAA",
        city: "City A",
        terminalName: "Terminal 1A",
        terminalCategory: "Domestic",
        continent: "Asia",
        urlImage: "http://example.com/image.jpg",
        fileId: 1,
      };

      prisma.airport.findUnique.mockResolvedValue(mockAirport);
      prisma.airport.update.mockResolvedValue(mockAirport);

      const response = await request(app)
        .put("/api/admin/airport/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Airport A",
          code: "AAA",
          city: "City A",
          terminalName: "Terminal 1A",
          terminalCategory: "Domestic",
          continent: "Asia",
          urlImage: "http://example.com/image.jpg",
          fileId: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("name", "Airport A");
    });

    it("should return 404 if airport not found", async () => {
      prisma.airport.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/admin/airport/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Airport A",
          code: "AAA",
          city: "City A",
          terminalName: "Terminal 1A",
          terminalCategory: "Domestic",
          continent: "Asia",
          urlImage: "http://example.com/image.jpg",
          fileId: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Bandara tidak ditemukan.");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.airport.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/admin/airport/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Airport A",
          code: "AAA",
          city: "City A",
          terminalName: "Terminal 1A",
          terminalCategory: "Domestic",
          continent: "Asia",
          urlImage: "http://example.com/image.jpg",
          fileId: 1,
        });

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("DELETE /api/admin/airport/:id", () => {
    it("should delete an airport", async () => {
      const mockAirport = {
        id: 1,
        deleteAt: null, // Ensure deleteAt is null
      };
  
      prisma.airport.findUnique.mockResolvedValue(mockAirport);
      prisma.airport.update.mockResolvedValue({ ...mockAirport, deleteAt: new Date() });
  
      const response = await request(app)
        .delete("/api/admin/airport/1")
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  
    it("should return 404 if airport not found", async () => {
      prisma.airport.findUnique.mockResolvedValue(null);
  
      const response = await request(app)
        .delete("/api/admin/airport/999")
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Bandara tidak ditemukan.");
    });
  
    it("should return 500 if there is a server error", async () => {
      prisma.airport.findUnique.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .delete("/api/admin/airport/1")
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });
});