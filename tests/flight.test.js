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

describe("FlightController", () => {
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
    prisma.flight.create = jest.fn();
    prisma.flight.findMany = jest.fn();
    prisma.flight.findUnique = jest.fn();
    prisma.flight.update = jest.fn();
    prisma.flight.count = jest.fn();
    prisma.airline.findMany = jest.fn();
    prisma.airport.findMany = jest.fn();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("GET /api/flight/search", () => {
    it("should return a list of flights based on search criteria", async () => {
      const mockFlights = [
        {
          id: 1,
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          departureCity: "CityA",
          arrivalCity: "CityB",
          departureDate: new Date().toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
    },10000);
  
    it("should return 404 if no flights are found", async () => {
      prisma.flight.findMany.mockResolvedValue([]);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          departureCity: "CityA",
          arrivalCity: "CityB",
          departureDate: new Date().toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Tidak ada penerbangan yang ditemukan");
    },10000);
  
    it("should return 500 if there is a server error", async () => {
      prisma.flight.findMany.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          departureCity: "CityA",
          arrivalCity: "CityB",
          departureDate: new Date().toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    },10000);
  
    it("should sort flights by price", async () => {
      const mockFlights = [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          sort: "price",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort flights by duration", async () => {
      const mockFlights = [
        { id: 1, duration: 100 },
        { id: 2, duration: 200 },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          sort: "duration",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort flights by earlier departure", async () => {
      const mockFlights = [
        { id: 1, departureTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, departureTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          sort: "earlierDeparture",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort flights by latest departure", async () => {
      const mockFlights = [
        { id: 1, departureTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, departureTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          sort: "latestDeparture",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  
    it("should sort flights by earlier arrival", async () => {
      const mockFlights = [
        { id: 1, arrivalTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, arrivalTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          sort: "earlierArrival",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort flights by latest arrival", async () => {
      const mockFlights = [
        { id: 1, arrivalTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, arrivalTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          sort: "latestArrival",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  
    it("should filter out previously displayed routes for homepage", async () => {
      global.displayedFlights = [
        { departureAirportId: 1, arrivalAirportId: 2 },
      ];
  
      const mockFlights = [
        {
          id: 1,
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        },
        {
          id: 2,
          airlineId: 1,
          departureAirportId: 3,
          arrivalAirportId: 4,
          flightNumber: "FL124",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          homepage: "true",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
    });
  
    it("should include the cheapest seat price for homepage", async () => {
      const mockFlights = [
        {
          id: 1,
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
          seats: [{ price: 100 }],
        },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          homepage: "true",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
      expect(response.body.payload.data[0]).toHaveProperty("seats");
      expect(response.body.payload.data[0].seats[0]).toHaveProperty("price");
    });
  
    it("should sort flights by views for homepage", async () => {
      const mockFlights = [
        { id: 1, views: 100 },
        { id: 2, views: 200 },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search")
        .query({
          homepage: "true",
          sort: "views",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  });

  describe("GET /api/flight/search-return", () => {
    it("should return a list of return flights based on search criteria", async () => {
      const mockFlights = [
        {
          id: 1,
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          departureCity: "CityA",
          arrivalCity: "CityB",
          returnDate: new Date().toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
    });
  
    it("should return 404 if no return flights are found", async () => {
      prisma.flight.findMany.mockResolvedValue([]);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          departureCity: "CityA",
          arrivalCity: "CityB",
          returnDate: new Date().toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Tidak ada penerbangan kembali yang ditemukan");
    });
  
    it("should return 500 if there is a server error", async () => {
      prisma.flight.findMany.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          departureCity: "CityA",
          arrivalCity: "CityB",
          returnDate: new Date().toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  
    it("should sort return flights by price", async () => {
      const mockFlights = [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          sort: "price",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort return flights by duration", async () => {
      const mockFlights = [
        { id: 1, duration: 100 },
        { id: 2, duration: 200 },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          sort: "duration",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort return flights by earlier departure", async () => {
      const mockFlights = [
        { id: 1, departureTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, departureTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          sort: "earlierDeparture",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort return flights by latest departure", async () => {
      const mockFlights = [
        { id: 1, departureTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, departureTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          sort: "latestDeparture",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  
    it("should sort return flights by earlier arrival", async () => {
      const mockFlights = [
        { id: 1, arrivalTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, arrivalTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          sort: "earlierArrival",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toEqual(mockFlights);
    });
  
    it("should sort return flights by latest arrival", async () => {
      const mockFlights = [
        { id: 1, arrivalTime: "2023-01-01T10:00:00.000Z" },
        { id: 2, arrivalTime: "2023-01-01T12:00:00.000Z" },
      ];
  
      prisma.flight.findMany.mockResolvedValue(mockFlights);
  
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          sort: "latestArrival",
        })
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });
  });

  describe("POST /api/admin/flight", () => {
    it("should create a new flight", async () => {
      const mockFlight = {
        id: 1,
        airlineId: 1,
        departureAirportId: 1,
        arrivalAirportId: 2,
        flightNumber: "FL123",
        departureTime: new Date(),
        arrivalTime: new Date(),
      };

      prisma.flight.create.mockResolvedValue(mockFlight);

      const response = await request(app)
        .post("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("id");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Semua field wajib diisi");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.flight.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        });

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("GET /api/admin/flight", () => {
    it("should return a list of flights", async () => {
      const mockFlights = [
        {
          id: 1,
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date(),
          arrivalTime: new Date(),
        },
      ];

      prisma.flight.findMany.mockResolvedValue(mockFlights);
      prisma.flight.count.mockResolvedValue(mockFlights.length);

      const response = await request(app)
        .get("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
    });

    it("should return 500 if there is a server error", async () => {
      prisma.flight.findMany.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("GET /api/admin/flight/:id", () => {
    it("should return flight details", async () => {
      const mockFlight = {
        id: 1,
        airlineId: 1,
        departureAirportId: 1,
        arrivalAirportId: 2,
        flightNumber: "FL123",
        departureTime: new Date(),
        arrivalTime: new Date(),
      };

      prisma.flight.findUnique.mockResolvedValue(mockFlight);

      const response = await request(app)
        .get("/api/admin/flight/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("id");
    });

    it("should return 404 if flight not found", async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/admin/flight/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Flight tidak ditemukan");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.flight.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/admin/flight/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("PUT /api/admin/flight/:id", () => {
    it("should update flight details", async () => {
      const mockFlight = {
        id: 1,
        airlineId: 1,
        departureAirportId: 1,
        arrivalAirportId: 2,
        flightNumber: "FL123",
        departureTime: new Date(),
        arrivalTime: new Date(),
      };

      prisma.flight.findUnique.mockResolvedValue(mockFlight);
      prisma.flight.update.mockResolvedValue(mockFlight);

      const response = await request(app)
        .put("/api/admin/flight/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          flightNumber: "FL124",
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("id");
    });

    it("should return 404 if flight not found", async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/admin/flight/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          flightNumber: "FL124",
        });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Flight tidak ditemukan");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.flight.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/admin/flight/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          flightNumber: "FL124",
        });

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("DELETE /api/admin/flight/:id", () => {
    it("should delete a flight", async () => {
      const mockFlight = {
        id: 1,
        deleteAt: new Date(),
      };

      prisma.flight.findUnique.mockResolvedValue(mockFlight);
      prisma.flight.update.mockResolvedValue(mockFlight);

      const response = await request(app)
        .delete("/api/admin/flight/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });

    it("should return 404 if flight not found", async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/admin/flight/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Flight tidak ditemukan");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.flight.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .delete("/api/admin/flight/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("POST /api/admin/flight", () => {
    it("should create a new flight", async () => {
      const mockFlight = {
        id: 1,
        airlineId: 1,
        departureAirportId: 1,
        arrivalAirportId: 2,
        flightNumber: "FL123",
        departureTime: new Date(),
        arrivalTime: new Date(),
      };
  
      prisma.flight.create.mockResolvedValue(mockFlight);
  
      const response = await request(app)
        .post("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        });
  
      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("id");
    });
  
    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
        });
  
      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Semua field wajib diisi");
    });
  
    it("should return 500 if there is a server error", async () => {
      prisma.flight.create.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .post("/api/admin/flight")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          airlineId: 1,
          departureAirportId: 1,
          arrivalAirportId: 2,
          flightNumber: "FL123",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
        });
  
      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("GET /api/admin/flight/createFlight", () => {
    it("should return data for creating a flight", async () => {
      const mockAirlines = [
        { id: 1, name: "Airline A" },
        { id: 2, name: "Airline B" },
      ];
  
      const mockAirports = [
        { id: 1, name: "Airport A", city: "City A" },
        { id: 2, name: "Airport B", city: "City B" },
      ];
  
      prisma.airline.findMany.mockResolvedValue(mockAirlines);
      prisma.airport.findMany.mockResolvedValue(mockAirports);
  
      const response = await request(app)
        .get("/api/admin/flight/createFlight")
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("airlines");
      expect(response.body.payload.data).toHaveProperty("departureAirports");
      expect(response.body.payload.data).toHaveProperty("arrivalAirports");
      expect(response.body.payload.data.airlines).toEqual(mockAirlines);
      expect(response.body.payload.data.departureAirports).toEqual(mockAirports);
      expect(response.body.payload.data.arrivalAirports).toEqual(mockAirports);
    });
  
    it("should return 500 if there is a server error", async () => {
      prisma.airline.findMany.mockRejectedValue(new Error("Database error"));
      prisma.airport.findMany.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .get("/api/admin/flight/createFlight")
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });
});