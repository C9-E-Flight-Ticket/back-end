const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");

describe("FlightController", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("GET /api/flight/search", () => {
    it("should search for flights", async () => {
      const response = await request(app).get("/api/flight/search").query({
        departureCity: "Jakarta",
        arrivalCity: "Denpasar",
        departureDate: "2024-12-20",
        seatClass: "Economy",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
    });

    it("should return 404 if no flights found", async () => {
      const response = await request(app).get("/api/flight/search").query({
        departureCity: "InvalidCity",
        arrivalCity: "InvalidCity",
        departureDate: "2024-12-25",
        seatClass: "Economy",
      });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Tidak ada penerbangan yang ditemukan"
      );
    });
  });

  describe("GET /api/flight/search-return", () => {
    it("should search for return flights", async () => {
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          departureCity: "Jakarta",
          arrivalCity: "Denpasar",
          returnDate: "2024-12-27",
          seatClass: "Economy",
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toBeInstanceOf(Array);
    });

    it("should return 404 if no return flights found", async () => {
      const response = await request(app)
        .get("/api/flight/search-return")
        .query({
          departureCity: "InvalidCity",
          arrivalCity: "InvalidCity",
          returnDate: "2024-12-30",
          seatClass: "Economy",
        });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Tidak ada penerbangan kembali yang ditemukan"
      );
    });
  });
});
