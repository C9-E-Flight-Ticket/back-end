const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const { sendOtp } = require("../utils/otp");

class RegisterController {

    // Register user
    static async register(req, res) {
        const { name, email, phoneNumber, password } = req.body;

        try {
            const existingUser = await prisma.user.findFirst({
                where: { email },
            });

            if (existingUser) {
                return response(400, "error", null, "Email sudah terdaftar!", res);
            }

            const otp = await sendOtp(email);
            const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

            const user = await prisma.user.create({
                data: { 
                    name, 
                    email, 
                    phoneNumber, 
                    password: hashedPassword,
                    otp_code: otp,
                    is_verified: false
                },
            });

            response(200, "success", user, "Berhasil register, silahkan cek email untuk verifikasi", res);
            
        } catch (error) {
            console.error("Registration error:", error);
            response(500, "error", null, "Terjadi kesalahan saat registrasi", res);
        }
    }

    // Verify OTP
    static async verifyEmail(req, res) {
        try {
            const user = req.user;

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { 
                    is_verified: true,
                    otp_code: null
                },
            });

            response(200, "success", updatedUser, "Email berhasil diverifikasi", res);

        } catch (error) {
            console.error("OTP verification error:", error);
            response(500, "error", null, "Terjadi kesalahan saat verifikasi OTP", res);
        }
    }
}

module.exports = RegisterController;
