const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");

describe("TransactionController", () => {
  let bookingCode;
  let token;
  let adminToken;
  let userId;
  let pdfPath;
  let transactionId;

  beforeAll(async () => {
    // Login dengan pengguna yang sudah ada
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "user3@example.com", password: "qwerty123" });

    if (response.status === 200 && response.body.payload.status === "success") {
      token = response.body.payload.data; // Ambil token langsung dari data respons
      if (response.headers["set-cookie"]) {
        const cookies = response.headers["set-cookie"];
        const tokenCookie = cookies.find((cookie) =>
          cookie.startsWith("token=")
        );
        if (tokenCookie) {
          token = tokenCookie.split(";")[0].split("=")[1]; // Ambil nilai token dari cookie
        }
      }
      const userResponse = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${token}`);
      userId = userResponse.body.payload.data.id; // Ambil userId dari respons profil
    } else {
      console.error("Login response:", response.body);
      throw new Error("Login failed, response structure is not as expected");
    }

    // Login dengan admin
    const adminResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "qwerty123" });

    if (
      adminResponse.status === 200 &&
      adminResponse.body.payload.status === "success"
    ) {
      adminToken = adminResponse.body.payload.data; // Ambil token langsung dari data respons
      if (adminResponse.headers["set-cookie"]) {
        const cookies = adminResponse.headers["set-cookie"];
        const tokenCookie = cookies.find((cookie) =>
          cookie.startsWith("token=")
        );
        if (tokenCookie) {
          adminToken = tokenCookie.split(";")[0].split("=")[1]; // Ambil nilai token dari cookie
        }
      }
    } else {
      console.error("Admin login response:", adminResponse.body);
      throw new Error(
        "Admin login failed, response structure is not as expected"
      );
    }
  });

  afterAll(async () => {
    // Hapus data transaksi yang sudah dibuat
    if (bookingCode) {
      // Hapus tiket yang terkait dengan transaksi
      await prisma.ticket.deleteMany({
        where: { transaction: { bookingCode } },
      });

      // Hapus transaksi
      await prisma.transaction.deleteMany({
        where: { bookingCode },
      });
    }

    await prisma.$disconnect();
    server.close();
  });

  describe("POST /api/transaction/order", () => {
    it("should create a new transaction", async () => {
      const response = await request(app)
        .post("/api/transaction/order")
        .set("Authorization", `Bearer ${token}`)
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

      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "Issued" },
      });

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data.transaction).toHaveProperty("id");
      expect(response.body.payload.data.tickets).toHaveLength(1);
      expect(response.body.payload.data.passengers).toHaveLength(1);
    }, 10000); // Tingkatkan timeout menjadi 10 detik

    it("should return 400 if input is invalid", async () => {
      const response = await request(app)
        .post("/api/transaction/order")
        .set("Authorization", `Bearer ${token}`)
        .send({
          seats: [],
          passengerDetails: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Invalid input");
    });
  });

  describe("GET /api/transaction/status/:bookingCode", () => {
    it("should get transaction status", async () => {
      const response = await request(app)
        .get(`/api/transaction/status/${bookingCode}`)
        .set("Authorization", `Bearer ${token}`);

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
    }, 10000); // Tingkatkan timeout menjadi 10 detik

    it("should return 404 if transaction not found", async () => {
      const response = await request(app)
        .get(`/api/transaction/status/invalidBookingCode`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Transaction not found");
    });
  });

  describe("GET /api/transaction/transactions", () => {
    it("should get all transactions by user", async () => {
      const response = await request(app)
        .get("/api/transaction/transactions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
      expect(response.body.payload.data[0]).toHaveProperty("userId", userId);
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
    }, 10000); // Tingkatkan timeout menjadi 10 detik

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app).get("/api/transaction/transactions");

      expect(response.status).toBe(401);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Authentication required");
    });

    it("should return 500 if there is a server error", async () => {
      jest.spyOn(prisma.transaction, "findMany").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get("/api/transaction/transactions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Database error");
    });
  });

  describe("GET /api/transaction/generate-pdf/:bookingCode", () => {
    it(`should generate transaction PDF ${bookingCode}`, async () => {
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/${bookingCode}`)
        .set("Authorization", `Bearer ${token}`);

      pdfPath = response.body.payload.data.pdfPath;

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("qrCode");
      expect(response.body.payload.data).toHaveProperty("downloadUrl");
      expect(response.body.payload.data).toHaveProperty("pdfPath");
    }, 20000); // Tingkatkan timeout menjadi 20 detik

    it("should return 404 if transaction not found", async () => {
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/invalidBookingCode`)
        .set("Authorization", `Bearer ${token}`);

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
        .get(`/api/transaction/download/${bookingCode}.pdf`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/pdf");
      expect(response.headers["content-disposition"]).toContain(
        `${bookingCode}.pdf`
      );
    }, 10000); // Tingkatkan timeout menjadi 10 detik

    it("should return 404 if PDF not found", async () => {
      const response = await request(app)
        .get(`/api/transaction/download/invalidBookingCode.pdf`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("PDF not found");
    });
  });

  describe("DELETE /api/admin/transaction/:id/soft-delete", () => {
    it("should soft delete a transaction", async () => {
      const response = await request(app)
        .delete(`/api/admin/transaction/${transactionId}/soft-delete`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("deleteAt");
    });

    it("should return 404 if transaction not found", async () => {
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
      const response = await request(app)
        .patch(`/api/admin/transaction/${transactionId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("deleteAt", null);
    });

    it("should return 404 if deleted transaction not found", async () => {
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
      const response = await request(app)
        .get("/api/admin/transaction/history")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
      expect(response.body.payload.data.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/transaction/midtrans/notification", () => {
    it("should return 500 if there is a server error", async () => {
      const notificationJson = {
        order_id: bookingCode,
        transaction_status: "settlement",
        fraud_status: "accept",
        payment_type: "credit_card",
      };

      const response = await request(app)
        .post("/api/transaction/midtrans/notification")
        .send(notificationJson);

      expect(response.status).toBe(500);
      expect(response.body.payload.status).toBe("error");
    });
  });
});
