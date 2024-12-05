const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const { sendOtp, verifyOtp, OTP_TYPES } = require("../utils/otp");

class ForgotPasswordController {
    // Forgot Password
    static async forgotPassword(req, res) {
        const { email } = req.body;

        try {
            if (!email) {
                return response(400, "error", null, "Email harus diisi", res);
            }

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return response(404, "error", null, "Email tidak terdaftar", res);
            }

            await sendOtp(email, OTP_TYPES.PASSWORD_RESET);

            return response(200, "success", {
                userId: user.id
            }, "OTP untuk reset password telah dikirim ke email Anda", res);

        } catch (error) {
            console.error("Forgot password error:", error);
            return response(500, "error", null, "Terjadi kesalahan saat memproses permintaan", res);
        }
    }

    static async verifyOTP(req, res) {
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
                return response(400, "error", null, otpError.message, res);
            }

        } catch (error) {
            console.error("OTP verification error:", error);
            return response(500, "error", null, "Terjadi kesalahan saat verifikasi OTP", res);
        }
    }

    static async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword, retypePassword } = req.body;

            if (!newPassword || !retypePassword) {
                return response(400, "error", null, "Password baru dan konfirmasi password harus diisi", res);
            }

            if (newPassword !== retypePassword) {
                return response(400, "error", null, "Password dan konfirmasi password tidak cocok", res);
            }

            if (newPassword.length < 8) {
                return response(400, "error", null, "Password minimal 8 karakter", res);
            }

            const user = await prisma.user.findUnique({
                where: { id: Number(id) }
            });

            if (!user) {
                return response(404, "error", null, "User tidak ditemukan", res);
            }

            // Check for recently verified OTP
            const verifiedOtp = await prisma.oTP.findFirst({
                where: {
                    userId: user.id,
                    type: OTP_TYPES.PASSWORD_RESET,
                    revokedAt: null,
                    verifiedAt: {
                        not: null
                    },
                    expiresAt: {
                        gt: new Date()
                    }
                },
                orderBy: {
                    verifiedAt: 'desc'
                }
            });

            if (!verifiedOtp) {
                return response(401, "error", null, "Silakan verifikasi OTP terlebih dahulu atau OTP sudah kadaluarsa", res);
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
            console.error("Reset password error:", error);
            return response(500, "error", null, "Terjadi kesalahan saat reset password", res);
        }
    }
}

module.exports = ForgotPasswordController;
