const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp, OTP_TYPES } = require("../utils/otp");

jest.mock("../utils/otp");

let userIdRegister;
let hashPassword;

describe("RegisterController", () => {

  beforeAll(async () => {
    hashPassword = await bcrypt.hash("password", 10);
    // Delete related OTP records first
    const user = await prisma.user.findUnique({
      where: { email: "user@mail.com" }
    });

    if (user) {
      await prisma.oTP.deleteMany({
        where: { userId: user.id }
      });
      
      await prisma.user.deleteMany({
        where: { email: "user@mail.com" }
      });
    }

    // Mock sendOtp to always succeed
    sendOtp.mockResolvedValue({
      success: true,
      message: "OTP berhasil dikirim ke email"
    });

    // Mock verifyOtp to always succeed
    verifyOtp.mockResolvedValue({
      success: true,
      message: "OTP berhasil diverifikasi"
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close(); // Ensure the server is closed after tests
  });

  describe("POST /api/auth/register", () => {
    it("should return success message", async () => {
      const mockUser = {
        name: "User",
        email: "user@mail.com",
        password: hashPassword,
        phoneNumber: "1234567890",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUser);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe(
        "Berhasil register, silahkan cek email untuk verifikasi"
      );

      userIdRegister = response.body.payload.data.user.id;
    });

    
    it("should return 400 error field is empty", async () => {
      const mockUser = {
        name: "User",
        email: "user2@mail.com",
        phoneNumber: "1234567890",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Semua field harus diisi"
      );

    });

    it("should return 400 error email already exist", async () => {
      const mockUser = {
        name: "User",
        email: "user@mail.com",
        password: hashPassword,
        phoneNumber: "1234567890",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe(
        "Email sudah terdaftar"
      );

    });

  });

  describe("POST /api/auth/verify-email/:id", () => {
    it("should verify email successfully", async () => {
      const response = await request(app)
        .post(`/api/auth/verify-email/${userIdRegister}`)
        .send({ otp: "123456" });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Email berhasil diverifikasi");
    });

    it("should return 400 error OTP is empty", async () => {
      const response = await request(app)
        .post(`/api/auth/verify-email/${userIdRegister}`)
        .send({ otp: "" });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("OTP harus diisi");
    });

    it("should return 404 error user not found", async () => {
      const response = await request(app)
        .post(`/api/auth/verify-email/999999`)
        .send({ otp: "123456" });

      expect(response.status).toBe(404);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("User tidak ditemukan");
    });

    it("should return 400 error email already verified", async () => {
      // First, verify the email
      await request(app)
        .post(`/api/auth/verify-email/${userIdRegister}`)
        .send({ otp: "123456" });

      // Try to verify again
      const response = await request(app)
        .post(`/api/auth/verify-email/${userIdRegister}`)
        .send({ otp: "123456" });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Email sudah terverifikasi");
    });
    
  });
});