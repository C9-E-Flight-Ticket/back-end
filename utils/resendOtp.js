const prisma = require("../models/prismaClients");
const { sendOtp, OTP_TYPES } = require("./otp");
const response = require("./response");

const resendOtp = async (req, res) => {
    const { id } = req.params;
    const { type = OTP_TYPES.EMAIL_VERIFICATION } = req.body;

    if (!id) {
        return response(400, "error", null, "ID harus diisi", res);
    }

    if (![OTP_TYPES.EMAIL_VERIFICATION, OTP_TYPES.PASSWORD_RESET].includes(type)) {
        return response(400, "error", null, "Tipe OTP tidak valid", res);
    }

    try {
        const userId = Number(id);
        
        if (isNaN(userId)) {
            return response(400, "error", null, "ID tidak valid", res);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return response(404, "error", null, "User tidak ditemukan", res);
        }

        if (type === OTP_TYPES.EMAIL_VERIFICATION && user.is_verified) {
            return response(400, "error", null, "Email sudah terverifikasi", res);
        }

        await sendOtp(user.email, type);
        
        const message = type === OTP_TYPES.PASSWORD_RESET 
            ? "OTP untuk reset password berhasil dikirim ulang"
            : "OTP untuk verifikasi email berhasil dikirim ulang";
            
        return response(200, "success", null, message, res);

    } catch (error) {
        console.error("Resend OTP error:", error);
        return response(500, "error", null, "Terjadi kesalahan saat mengirim ulang OTP", res);
    }
};

module.exports = resendOtp; 