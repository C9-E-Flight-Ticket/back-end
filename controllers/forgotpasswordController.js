const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp, OTP_TYPES } = require("../utils/otp");
const { AppError } = require("../middleware/errorMiddleware");

class ForgotPasswordController {
    // Forgot Password
    static async forgotPassword(req, res, next) {
        const { email } = req.body;

        try {
            if (!email) {
                return next(new AppError("Email harus diisi", 400));
            }

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return next(new AppError("Email tidak terdaftar", 404));
            }

            await sendOtp(email, OTP_TYPES.PASSWORD_RESET);

            return response(200, "success", {
                userId: user.id
            }, "OTP untuk reset password telah dikirim ke email Anda", res);

        } catch (error) {
            next(error);
        }
    }

    static async verifyOTP(req, res, next) {
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

            try {
                await verifyOtp(user.email, otp, OTP_TYPES.PASSWORD_RESET);
                
                const verifiedOtp = await prisma.oTP.findFirst({
                    where: {
                        userId: user.id,
                        type: OTP_TYPES.PASSWORD_RESET,
                        revokedAt: null,
                        verifiedAt: null,
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                if (verifiedOtp) {
                    await prisma.oTP.update({
                        where: { id: verifiedOtp.id },
                        data: {
                            verifiedAt: new Date()
                        }
                    });
                }

                return response(200, "success", { userId: user.id }, "OTP berhasil diverifikasi", res);
            } catch (otpError) {
                return next(new AppError(otpError.message, 400));
            }

        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req, res, next) {
        try {
            const { id } = req.params;
            const { newPassword, retypePassword } = req.body;

            if (!newPassword || !retypePassword) {
                return next(new AppError("Password baru dan konfirmasi password harus diisi", 400));
            }

            if (newPassword !== retypePassword) {
                return next(new AppError("Password dan konfirmasi password tidak cocok", 400));
            }

            if (newPassword.length < 8) {
                return next(new AppError("Password minimal 8 karakter", 400));
            }

            const user = await prisma.user.findUnique({
                where: { id: Number(id) }
            });

            if (!user) {
                return next(new AppError("User tidak ditemukan", 404));
            }

            const verifiedOtp = await prisma.oTP.findFirst({
                where: {
                    userId: user.id,
                    type: OTP_TYPES.PASSWORD_RESET,
                    revokedAt: null,
                    verifiedAt: {
                        not: null
                    }
                },
                orderBy: {
                    verifiedAt: 'desc'
                }
            });

            if (!verifiedOtp) {
                return next(new AppError("Silakan verifikasi OTP terlebih dahulu", 401));
            }

            const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS));

            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    password: hashedPassword,
                    updateAt: new Date()
                }
            });

            await prisma.oTP.updateMany({
                where: {
                    userId: user.id,
                    type: OTP_TYPES.PASSWORD_RESET,
                    revokedAt: null
                },
                data: {
                    revokedAt: new Date()
                }
            });

            return response(200, "success", null, "Password berhasil diubah", res);

        } catch (error) {
            next(error);
        }
    }
}

module.exports = ForgotPasswordController;
