const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");
const bcrypt = require("bcrypt");
const { sendOtp } = require("../utils/otp");
const AuthMiddleware = require("../middleware/authMiddleware");

jest.mock("bcrypt");
jest.mock("../utils/otp");

describe("AuthController", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe("POST /api/auth/register", () => {
    const endpoint = "/api/auth/register";

    it("should register a new user successfully", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "081234567890",
        password: "hashedpassword",
        is_verified: false,
      };

      bcrypt.hash.mockResolvedValue("hashedpassword");
      sendOtp.mockResolvedValue();

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post(endpoint).send({
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "081234567890",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe(
        "Berhasil register, silahkan cek email untuk verifikasi"
      );
      expect(response.body.payload.data.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phoneNumber: mockUser.phoneNumber,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post(endpoint).send({
        name: "John Doe",
        email: "john@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.payload.message).toBe("Semua field harus diisi");
    });

    it("should return 400 if email is already registered", async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 1 });

      const response = await request(app).post(endpoint).send({
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "081234567890",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.payload.message).toBe("Email sudah terdaftar");
    });

    it("should return 200 if OTP sending fails", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "081234567890",
        password: "hashedpassword",
        is_verified: false,
      };

      bcrypt.hash.mockResolvedValue("hashedpassword");
      sendOtp.mockRejectedValue(new Error("Failed to send OTP"));

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post(endpoint).send({
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "081234567890",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe(
        "Berhasil register, tapi gagal mengirim OTP. Silakan minta OTP baru"
      );
      expect(response.body.payload.data.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phoneNumber: mockUser.phoneNumber,
      });
    });
  });

  describe("POST /api/auth/login", () => {
    const endpoint = "/api/auth/login";

    it("should login successfully with correct credentials", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        is_verified: true,
      };

      bcrypt.compare.mockResolvedValue(true);

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post(endpoint).send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Berhasil login");
    });

    it("should return 404 if email is not registered", async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const response = await request(app).post(endpoint).send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(404);
      expect(response.body.payload.message).toBe("Email tidak terdaftar");
    });

    it("should return 401 if password is incorrect", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        is_verified: true,
      };

      bcrypt.compare.mockResolvedValue(false);

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post(endpoint).send({
        email: "john@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.payload.message).toBe("Maaf, kata sandi salah");
    });

    it("should return 401 if account is not verified", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        is_verified: false,
      };

      bcrypt.compare.mockResolvedValue(true);

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post(endpoint).send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.payload.message).toBe(
        "Akun belum terverifikasi. Silakan verifikasi email Anda."
      );
    });
  });
});
