const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");

describe("SeatController - getDetailFlight", () => {
  let token;

  beforeAll(async () => {
    // Login dengan pengguna yang sudah ada (jika diperlukan autentikasi)
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "qwerty123" });

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
    } else {
      console.error("Login response:", response.body);
      throw new Error("Login failed, response structure is not as expected");
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("GET /api/seat/detail-flight", () => {
    it("should return flight details with available seats", async () => {
      // Mock prisma.flight.findUnique to return flights for the given IDs
      jest.spyOn(prisma.flight, "findUnique").mockImplementation((params) => {
        const flights = [
          { id: 1, name: "Flight 1" },
          { id: 2, name: "Flight 2" },
          { id: 3, name: "Flight 3" },
        ];
        return flights.find((flight) => flight.id === params.where.id) || null;
      });

      const response = await request(app)
        .get("/api/seat/detail-flight")
        .set("Authorization", `Bearer ${token}`) // Tambahkan ini jika diperlukan autentikasi
        .query({
          flightId: [1, 2, 3],
          seatClass: "Economy",
          adult: 1,
          child: 0,
          baby: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("flights");
      expect(response.body.payload.data.flights).toBeInstanceOf(Array);
      expect(response.body.payload.data.flights[0]).toHaveProperty("seats");
      expect(response.body.payload.data.flights[0].seats).toBeInstanceOf(Array);
    },10000);

    it("should return 400 if flightId is missing", async () => {
      const response = await request(app)
        .get("/api/seat/detail-flight")
        .set("Authorization", `Bearer ${token}`) // Tambahkan ini jika diperlukan autentikasi
        .query({
          seatClass: "Economy",
          adult: 1,
          child: 0,
          baby: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "flightId harus berisi minimal satu flightId"
      );
    });

    it("should return 404 if no seats available for the flight", async () => {
      const response = await request(app)
        .get("/api/seat/detail-flight")
        .set("Authorization", `Bearer ${token}`) // Tambahkan ini jika diperlukan autentikasi
        .query({
          flightId: 9999, // Assuming this flightId does not exist
          seatClass: "Economy",
          adult: 1,
          child: 0,
          baby: 0,
        });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Flight tidak ditemukan"
      );
    });

    it("should return flight details without seatClass filter", async () => {
      const response = await request(app)
        .get("/api/seat/detail-flight")
        .set("Authorization", `Bearer ${token}`) // Tambahkan ini jika diperlukan autentikasi
        .query({
          flightId: 1,
          adult: 1,
          child: 0,
          baby: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("flights");
      expect(response.body.payload.data.flights).toBeInstanceOf(Array);
      expect(response.body.payload.data.flights[0]).toHaveProperty("seats");
      expect(response.body.payload.data.flights[0].seats).toBeInstanceOf(Array);
    });
    
    it("should return 404 if no seats are available for the flight", async () => {
      // Mock prisma.seat.findMany to return an empty array
      jest.spyOn(prisma.seat, "findMany").mockResolvedValue([]);

      const response = await request(app)
        .get("/api/seat/detail-flight")
        .set("Authorization", `Bearer ${token}`) // Tambahkan ini jika diperlukan autentikasi
        .query({
          flightId: 1,
          seatClass: "Economy",
          adult: 1,
          child: 0,
          baby: 0,
        });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Tidak ada kursi yang tersedia untuk penerbangan ini"
      );
    });
  });
});
