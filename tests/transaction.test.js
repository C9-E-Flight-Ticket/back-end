const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");

describe("TransactionController", () => {
  let token;
  let userId;
  let bookingCode;

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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("POST /api/transaction/order", () => {
    it("should create a new transaction", async () => {
      const response = await request(app)
        .post("/api/transaction/order")
        .set("Authorization", `Bearer ${token}`)
        .send({
          seats: [1, 2],
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
            {
              title: "Mrs",
              name: "Jane Doe",
              familyName: "Doe",
              dateOfBirth: "1992-01-01",
              nationality: "USA",
              identityNumber: "987654321",
              issuingCountry: "USA",
              category: "Adult",
            },
          ],
        });

      bookingCode = response.body.payload.data.transaction.bookingCode;

      expect(response.status).toBe(201);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data.transaction).toHaveProperty("id");
      expect(response.body.payload.data.tickets).toHaveLength(2);
      expect(response.body.payload.data.passengers).toHaveLength(2);
    }, 10000); // Tingkatkan timeout menjadi 10 detik
  });

  describe("POST /api/transaction/midtrans-callback", () => {
    it("should handle Midtrans callback", async () => {
      const response = await request(app)
        .post("/api/transaction/midtrans-callback")
        .set("Authorization", `Bearer ${token}`)
        .send({
          order_id: bookingCode,
          transaction_status: "settlement",
          fraud_status: "accept",
          payment_type: "credit_card",
        });
      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    }, 10000); // Tingkatkan timeout menjadi 10 detik
  });

  describe("GET /api/transaction/status/:bookingCode", () => {
    it("should get transaction status", async () => {
      const response = await request(app)
        .get(`/api/transaction/status/${bookingCode}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("bookingCode", bookingCode);
      expect(response.body.payload.data).toHaveProperty("Tickets");
      expect(response.body.payload.data.Tickets[0]).toHaveProperty("seat");
      expect(response.body.payload.data.Tickets[0].seat).toHaveProperty("flight");
      expect(response.body.payload.data.Tickets[0].seat.flight).toHaveProperty("departureAirport");
      expect(response.body.payload.data.Tickets[0].seat.flight).toHaveProperty("arrivalAirport");
      expect(response.body.payload.data.Tickets[0].seat.flight).toHaveProperty("airline");
      expect(response.body.payload.data.Tickets[0]).toHaveProperty("passenger");
      expect(response.body.payload.data).toHaveProperty("user");
    }, 10000); // Tingkatkan timeout menjadi 10 detik
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
      expect(response.body.payload.data[0].Tickets[0].seat).toHaveProperty("flight");
      expect(response.body.payload.data[0].Tickets[0].seat.flight).toHaveProperty("departureAirport");
      expect(response.body.payload.data[0].Tickets[0].seat.flight).toHaveProperty("arrivalAirport");
      expect(response.body.payload.data[0].Tickets[0].seat.flight).toHaveProperty("airline");
      expect(response.body.payload.data[0].Tickets[0]).toHaveProperty("passenger");
      expect(response.body.payload.data[0]).toHaveProperty("user");
    }, 10000); // Tingkatkan timeout menjadi 10 detik
  });

  describe("GET /api/transaction/generate-pdf/:bookingCode", () => {
    it("should generate transaction PDF", async () => {
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/${bookingCode}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("qrCode");
      expect(response.body.payload.data).toHaveProperty("downloadUrl");
      expect(response.body.payload.data).toHaveProperty("pdfPath");
    }, 20000); // Tingkatkan timeout menjadi 20 detik
  });

  describe("GET /api/transaction/download/:bookingCode", () => {
    it("should download transaction PDF", async () => {
      const response = await request(app)
        .get(`/api/transaction/download/${bookingCode}.pdf`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain(`${bookingCode}.pdf`);
    }, 10000); // Tingkatkan timeout menjadi 10 detik
  });
});
