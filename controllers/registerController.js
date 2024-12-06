const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp, OTP_TYPES } = require("../utils/otp");

class RegisterController {
    // Register user
    static async register(req, res) {
        const { name, email, phoneNumber, password } = req.body;

        try {
            if (!name || !email || !phoneNumber || !password) {
                return response(400, "error", null, "Semua field harus diisi", res);
            }

            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true}
            });

            if (existingUser) {
                return response(400, "error", null, "Email sudah terdaftar", res);
            }

            const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

            const user = await prisma.user.create({
                data: { 
                    name, 
                    email, 
                    phoneNumber, 
                    password: hashedPassword,
                    is_verified: false
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    is_verified: true
                }
            });

            try {

                await sendOtp(email, OTP_TYPES.EMAIL_VERIFICATION);
                
                return response(200, "success", {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber
                    }
                }, "Berhasil register, silahkan cek email untuk verifikasi", res);
            } catch (otpError) {
                console.error("Error sending OTP:", otpError);
                return response(200, "success", {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber
                    }
                }, "Berhasil register, tapi gagal mengirim OTP. Silakan minta OTP baru", res);
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                return response(400, "error", null, "Email sudah terdaftar", res);
            }
            return response(500, "error", null, "Terjadi kesalahan saat registrasi", res);
        }
    }

    // Verify OTP
    static async verifyEmail(req, res) {
        try {
            const { id } = req.params;
            const { otp } = req.body;
            
            if (!otp) {
                return response(400, "error", null, "OTP harus diisi", res);
            }

            const user = await prisma.user.findUnique({
                where: { id: Number(id) }
            });

            if (!user) {
                return response(404, "error", null, "User tidak ditemukan", res);
            }

            if (user.is_verified) {
                return response(400, "error", null, "Email sudah terverifikasi", res);
            }

            try {
                await verifyOtp(user.email, otp, OTP_TYPES.EMAIL_VERIFICATION);
                
                const updatedUser = await prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        is_verified: true
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        is_verified: true,
                        role: true
                    }
                });

                return response(200, "success", updatedUser, "Email berhasil diverifikasi", res);
            } catch (otpError) {
                return response(400, "error", null, otpError.message, res);
            }
        } catch (error) {
            console.error("Verification error:", error);
            return response(500, "error", null, "Terjadi kesalahan saat verifikasi", res);
        }
    }
}

module.exports = RegisterController;
