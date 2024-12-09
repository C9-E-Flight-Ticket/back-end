const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp, OTP_TYPES } = require("../utils/otp");
const AuthMiddleware = require("../middleware/authMiddleware");
const CookieMiddleware = require("../middleware/cookieMiddleware");
const { AppError } = require("../middleware/errorMiddleware");

class RegisterController {
    // Register user
    static async register(req, res, next) {
        const { name, email, phoneNumber, password } = req.body;

        try {
            if (!name || !email || !phoneNumber || !password) {
                return next(new AppError("Semua field harus diisi", 400));
            }

            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true}
            });

            if (existingUser) {
                return next(new AppError("Email sudah terdaftar", 400));
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
                return next(new AppError("Email sudah terdaftar", 400));
            }
            return response(500, "error", null, "Terjadi kesalahan saat registrasi", res);
        }
    }

    // Verify OTP
    static async verifyEmail(req, res, next) {
        try {
            const { id } = req.params;
            const { otp } = req.body;
            
            if (!otp) {
                return next(new AppError("OTP harus diisi", 400));
            }

            const user = await prisma.user.findUnique({
                where: { id: Number(id) }
            });

            if (!user) {
                return next(new AppError("User tidak ditemukan", 404));
            }

            if (user.is_verified) {
                return next(new AppError("Email sudah terverifikasi", 400));
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

                const token = AuthMiddleware.generateToken(updatedUser);
                CookieMiddleware.setTokenCookie(res, token);

                console.log("Cookie set:", token);
                
                return response(200, "success", updatedUser, "Email berhasil diverifikasi", res);
            } catch (otpError) {
                return next(new AppError(otpError.message, 400));
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RegisterController;
