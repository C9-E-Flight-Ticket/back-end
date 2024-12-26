const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp, OTP_TYPES } = require("../utils/otp");

jest.mock("../utils/otp");

describe("ForgotPasswordController", () => {
    let userId;

    beforeAll(async () => {
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

        // Create a mock user
        const mockUser = await prisma.user.create({
            data: {
                name: "Test User",
                email: "testuser@mail.com",
                password: await bcrypt.hash("password", 10),
                phoneNumber: "1234567890",
                is_verified: true
            }
        });

        userId = mockUser.id;
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: "testuser@mail.com" }
        });
        await prisma.$disconnect();
        server.close();
    });

    describe("POST /api/auth/forgot-password", () => {
        it("should send OTP to user's email", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: "testuser@mail.com" });

            expect(response.status).toBe(200);
            expect(response.body.payload.status).toBe("success");
            expect(response.body.payload.message).toBe(
                "OTP untuk reset password telah dikirim ke email Anda"
            );
        });

        it("should return 404 if email is not registered", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: "nonexistent@mail.com" });

            expect(response.status).toBe(404);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("Email tidak terdaftar");
        });

        it("should return 400 if email is not provided", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: "" });

            expect(response.status).toBe(400);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("Email harus diisi");
        });
    });

    describe("POST /api/auth/verify-otp/:id", () => {
        it("should verify OTP successfully", async () => {
            const response = await request(app)
                .post(`/api/auth/verify-otp/${userId}`)
                .send({ otp: "123456" });

            expect(response.status).toBe(200);
            expect(response.body.payload.status).toBe("success");
            expect(response.body.payload.message).toBe("OTP berhasil diverifikasi");
        });

        it("should return 400 if OTP is not provided", async () => {
            const response = await request(app)
                .post(`/api/auth/verify-otp/${userId}`)
                .send({ otp: "" });

            expect(response.status).toBe(400);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("OTP harus diisi");
        });

        it("should return 404 if user is not found", async () => {
            const response = await request(app)
                .post(`/api/auth/verify-otp/999999`)
                .send({ otp: "123456" });

            expect(response.status).toBe(404);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("User tidak ditemukan");
        });
    });

    describe("POST /api/auth/reset-password/:id", () => {
        // it("should reset password successfully", async () => {
        //     // Request to send OTP first
        //     const otpResponse = await request(app)
        //         .post(`/api/auth/forgot-password`)
        //         .send({ email: "testuser@mail.com" });

        //     const otpCode = otpResponse.body.payload.otp; // Capture the OTP sent

        //     // Verify OTP using the captured OTP
        //     await request(app)
        //         .post(`/api/auth/verify-otp/${userId}`)
        //         .send({ otp: otpCode }); // Use the captured OTP

        //     const response = await request(app)
        //         .post(`/api/auth/reset-password/${userId}`)
        //         .send({ newPassword: "newpassword123", retypePassword: "newpassword123" });

        //     expect(response.status).toBe(200);
        //     expect(response.body.payload.status).toBe("success");
        //     expect(response.body.payload.message).toBe("Password berhasil diubah");
        // });

        it("should return 400 if passwords do not match", async () => {
            const response = await request(app)
                .post(`/api/auth/reset-password/${userId}`)
                .send({ newPassword: "newpassword123", retypePassword: "differentpassword" });

            expect(response.status).toBe(400);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("Password dan konfirmasi password tidak cocok");
        });

        it("should return 400 if password is less than 6 characters", async () => {
            const response = await request(app)
                .post(`/api/auth/reset-password/${userId}`)
                .send({ newPassword: "123", retypePassword: "123" });

            expect(response.status).toBe(400);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("Password minimal 6 karakter");
        });

        it("should return 404 if user is not found", async () => {
            const response = await request(app)
                .post(`/api/auth/reset-password/999999`)
                .send({ newPassword: "newpassword123", retypePassword: "newpassword123" });

            expect(response.status).toBe(404);
            expect(response.body.payload.status).toBe("error");
            expect(response.body.payload.message).toBe("User tidak ditemukan");
        });
    });
});