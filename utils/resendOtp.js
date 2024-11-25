const prisma = require("../models/prismaClients");
const { sendOtp } = require("./otp");
const response = require("./response");

const resendOtp = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return response(400, "error", null, "ID harus diisi", res);
    }

    try {
        const userId = Number(id);
        
        if (isNaN(userId)) {
            return response(400, "error", null, "ID tidak valid", res);
        }

        const user = await prisma.user.findFirst({
            where: { 
                id: userId,
                is_verified: false
            },
        });

        if (!user) {
            return response(404, "error", null, "User tidak ditemukan atau sudah terverifikasi", res);
        }

        const hashedOtp = await sendOtp(user.email);

        await prisma.user.update({
            where: { id: user.id },
            data: { 
                otp_code: hashedOtp,
            },
        });

        return response(200, "success", null, "OTP baru telah dikirim ke email Anda", res);

    } catch (error) {
        console.error("Resend OTP error:", error);
        return response(500, "error", null, "Terjadi kesalahan saat mengirim ulang OTP", res);
    }
};

module.exports = resendOtp; 