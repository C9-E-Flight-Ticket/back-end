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

describe("TransactionController", () => {
  let userToken;
  let adminToken;
  let bookingCode;
  let transactionId;

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
    prisma.transaction.create = jest.fn();
    prisma.transaction.findMany = jest.fn();
    prisma.transaction.findUnique = jest.fn();
    prisma.transaction.update = jest.fn();
    prisma.transaction.deleteMany = jest.fn();
    prisma.ticket.deleteMany = jest.fn();
    prisma.seat.updateMany = jest.fn();
    prisma.passenger.create = jest.fn();
    prisma.notification.create = jest.fn();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("POST /api/transaction/order", () => {
    it("should create a new transaction", async () => {
      const mockTransaction = {
        id: 1,
        bookingCode: "ABC123",
        status: "Pending",
        userId: 2,
      };

      const mockTicket = {
        id: 1,
        seatId: 9,
        transactionId: 1,
      };

      const mockPassenger = {
        id: 1,
        name: "John Doe",
        transactionId: 1,
      };

      prisma.transaction.create.mockResolvedValue({
        ...mockTransaction,
        Tickets: [mockTicket],
        Passengers: [mockPassenger],
      });

      const response = await request(app)
        .post("/api/transaction/order")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          seats: [9],
          passengerDetails: [
            {
              title: "Mr",
              name: "John Doe",
              familyName: "Doe",
              dateOfBirth: "1990-01-01",
              nationality: "USA",
              identityNumber: "123456789",
              issuingCountry: "USA",
              category: "Adult",
            },
          ],
        });

      bookingCode = response.body.payload.data.transaction.bookingCode;
      transactionId = response.body.payload.data.transaction.id;

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data.transaction).toHaveProperty("id");
      expect(response.body.payload.data.tickets).toHaveLength(1);
      expect(response.body.payload.data.passengers).toHaveLength(1);
    }, 10000);

    it("should return 400 if input is invalid", async () => {
      const response = await request(app)
        .post("/api/transaction/order")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          seats: [],
          passengerDetails: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Invalid input");
    });
  });

  describe("POST /api/transaction/midtrans/notification", () => {
    it("should handle Midtrans callback and update transaction status", async () => {
      const notificationJson = {
        "va_numbers": [
          {
            "va_number": "44531792770671934547155",
            "bank": "bca"
          }
        ],
        "transaction_time": "2024-12-25 15:16:19",
        "transaction_status": "settlement",
        "transaction_id": "da6bed40-4d2b-4d3d-a6fa-487a97be2483",
        "status_message": "midtrans payment notification",
        "status_code": "200",
        "signature_key": "41b0779d01fcc25c7dd51f26db7e3e2702efcf72f30e4de657feb64d3bda190f5318695bcf04dcc3d6b77b0f0f565ec4c73d0eb77a2523f575753360fd343668",
        "settlement_time": "2024-12-25 15:16:30",
        "payment_type": "bank_transfer",
        "payment_amounts": [
      
        ],
        "order_id": "PTMw5iOIP",
        "merchant_id": "G075244531",
        "gross_amount": "1332000.00",
        "fraud_status": "accept",
        "expiry_time": "2024-12-25 16:16:19",
        "currency": "IDR"
      };

      const response = await request(app)
        .post("/api/transaction/midtrans/notification")
        .send(notificationJson);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });

    it("should return 500 if there is a server error", async () => {
      const notificationJson = {
        order_id: "ABC123",
        transaction_status: "settlement",
        fraud_status: "accept",
        payment_type: "credit_card",
      };

      prisma.transaction.update.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/transaction/midtrans/notification")
        .send(notificationJson);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
    });
  });

  describe("GET /api/transaction/status/:bookingCode", () => {
    it("should get transaction status", async () => {
      const mockTransaction = {
        bookingCode: bookingCode,
        Tickets: [
          {
            seat: {
              flight: {
                departureAirport: {},
                arrivalAirport: {},
                airline: {},
              },
            },
            passenger: {},
          },
        ],
        user: {},
      };

      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .get(`/api/transaction/status/${bookingCode}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty(
        "bookingCode",
        bookingCode
      );
      expect(response.body.payload.data).toHaveProperty("Tickets");
      expect(response.body.payload.data.Tickets[0]).toHaveProperty("seat");
      expect(response.body.payload.data.Tickets[0].seat).toHaveProperty(
        "flight"
      );
      expect(response.body.payload.data.Tickets[0].seat.flight).toHaveProperty(
        "departureAirport"
      );
      expect(response.body.payload.data.Tickets[0].seat.flight).toHaveProperty(
        "arrivalAirport"
      );
      expect(response.body.payload.data.Tickets[0].seat.flight).toHaveProperty(
        "airline"
      );
      expect(response.body.payload.data.Tickets[0]).toHaveProperty("passenger");
      expect(response.body.payload.data).toHaveProperty("user");
    });

    it("should return 404 if transaction not found", async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/transaction/status/invalidBookingCode`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Transaction not found");
    });
  });

  describe("GET /api/transaction/transactions", () => {
    it("should get all transactions by user", async () => {
      const mockTransactions = [
        {
          userId: 2,
          Tickets: [
            {
              seat: {
                flight: {
                  departureAirport: {},
                  arrivalAirport: {},
                  airline: {},
                },
              },
              passenger: {},
            },
          ],
          user: {},
        },
      ];

      prisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/api/transaction/transactions")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
      expect(response.body.payload.data[0]).toHaveProperty("userId", 2);
      expect(response.body.payload.data[0]).toHaveProperty("Tickets");
      expect(response.body.payload.data[0].Tickets[0]).toHaveProperty("seat");
      expect(response.body.payload.data[0].Tickets[0].seat).toHaveProperty(
        "flight"
      );
      expect(
        response.body.payload.data[0].Tickets[0].seat.flight
      ).toHaveProperty("departureAirport");
      expect(
        response.body.payload.data[0].Tickets[0].seat.flight
      ).toHaveProperty("arrivalAirport");
      expect(
        response.body.payload.data[0].Tickets[0].seat.flight
      ).toHaveProperty("airline");
      expect(response.body.payload.data[0].Tickets[0]).toHaveProperty(
        "passenger"
      );
      expect(response.body.payload.data[0]).toHaveProperty("user");
    });

    it("should return 500 if there is a server error", async () => {
      prisma.transaction.findMany.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/transaction/transactions")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("GET /api/transaction/generate-pdf/:bookingCode", () => {
    it("should generate transaction PDF", async () => {
      const mockTransaction = {
        bookingCode: bookingCode,
        status: "Issued",
        userId: 2,
        Tickets: [
          {
            seat: {
              flight: {
                departureAirport: {},
                arrivalAirport: {},
                airline: {},
              },
            },
            passenger: {},
          },
        ],
        user: {},
      };

      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .get(`/api/transaction/generate-pdf/${bookingCode}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("qrCode");
      expect(response.body.payload.data).toHaveProperty("downloadUrl");
      expect(response.body.payload.data).toHaveProperty("pdfPath");
    });

    it("should return 404 if transaction not found", async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/transaction/generate-pdf/invalidBookingCode`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Transaction not found or unauthorized access"
      );
    });

    it("should return 404 if no tickets found for the transaction", async () => {
      const mockTransaction = {
        bookingCode: bookingCode,
        status: "Issued",
        userId: 2,
        Tickets: [],
        user: {},
      };
  
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
  
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/${bookingCode}`)
        .set("Authorization", `Bearer ${userToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "No tickets found for this transaction"
      );
    });
  
    it("should return 404 if transaction not found", async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
  
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/invalidBookingCode`)
        .set("Authorization", `Bearer ${userToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Transaction not found or unauthorized access"
      );
    });
  });

  describe("GET /api/transaction/download/:bookingCode", () => {
    it("should download transaction PDF", async () => {
      const response = await request(app)
        .get(`/api/transaction/download/${bookingCode}.pdf`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/pdf");
      expect(response.headers["content-disposition"]).toContain(
        `${bookingCode}.pdf`
      );
    });

    it("should return 404 if PDF not found", async () => {
      const response = await request(app)
        .get(`/api/transaction/download/invalidBookingCode.pdf`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("PDF not found");
    });
  });

  describe("DELETE /api/admin/transaction/:id/soft-delete", () => {
    it("should soft delete a transaction", async () => {
      const mockTransaction = {
        id: transactionId,
        deleteAt: new Date(),
      };

      prisma.transaction.update.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .delete(`/api/admin/transaction/${transactionId}/soft-delete`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("deleteAt");
    });

    it("should return 404 if transaction not found", async () => {
      prisma.transaction.update.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/admin/transaction/999999/soft-delete`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Transaction not found");
    });
  });

  describe("PUT /api/admin/transaction/restore/:id", () => {
    it("should restore a soft deleted transaction", async () => {
      const mockTransaction = {
        id: transactionId,
        deleteAt: new Date(),
      };

      // First, mock the soft-deleted transaction
      prisma.transaction.findUnique.mockResolvedValueOnce(mockTransaction);

      // Then, mock the restored transaction
      const restoredTransaction = {
        ...mockTransaction,
        deleteAt: null,
      };

      prisma.transaction.update.mockResolvedValueOnce(restoredTransaction);

      const response = await request(app)
        .patch(`/api/admin/transaction/${transactionId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("deleteAt", null);
    });

    it("should return 404 if deleted transaction not found", async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/admin/transaction/9999999/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Deleted transaction not found"
      );
    });
  });

  describe("GET /api/admin/transaction/history", () => {
    it("should get all transactions for admin", async () => {
      const mockTransactions = [
        {
          id: 1,
          bookingCode: "ABC123",
          status: "Issued",
          userId: 2,
        },
      ];

      prisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/api/admin/transaction/history")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
    });

    // Add more test cases here
  });

  describe("POST /api/transaction/midtrans/notification", () => {
    it("should return 500 if there is a server error", async () => {
      const notificationJson = {
        order_id: bookingCode,
        transaction_status: "settlement",
        fraud_status: "accept",
        payment_type: "credit_card",
      };

      prisma.transaction.update.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/transaction/midtrans/notification")
        .send(notificationJson);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
    });
  });
});