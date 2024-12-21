const request = require("supertest");
const { app, serverInstance } = require("../app");
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
      if (response.headers['set-cookie']) {
        const cookies = response.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split(';')[0].split('=')[1]; // Ambil nilai token dari cookie
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
    serverInstance.close();
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
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("bookingCode", bookingCode);
    }, 10000); // Tingkatkan timeout menjadi 10 detik
  });

  describe("GET /api/transaction/generate-pdf/:bookingCode", () => {
    it("should generate transaction PDF", async () => {
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/${bookingCode}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("qrCode");
      expect(response.body.data).toHaveProperty("downloadUrl");
    }, 10000); // Tingkatkan timeout menjadi 10 detik
  });
});