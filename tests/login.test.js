const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");

describe("LoginController", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("POST /api/auth/login", () => {
    it("should return a token", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "qwerty123" });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
    });

    it("should return 404 for unregistered email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "unregistered@example.com", password: "qwerty123" });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Email tidak terdaftar");
    });

    it("should return 401 for incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Maaf, kata sandi salah");
    });

    it("should return 401 for unverified account", async () => {
      // Ensure the test database has an unverified user with this email
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "qwerty123" });

      expect(response.status).toBe(401);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Akun belum terverifikasi. Silakan verifikasi email Anda."
      );
    });
  });

  describe("GET /api/auth/logout", () => {
    it("should logout successfully", async () => {
      // Login untuk mendapatkan token dan cookie
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "qwerty123" });

      const cookies = loginResponse.headers["set-cookie"];

      // Logout dengan cookie
      const response = await request(app)
        .get("/api/auth/logout")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Berhasil logout");
    });
  });
});
