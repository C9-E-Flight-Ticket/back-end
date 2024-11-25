const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const { verifyOtp } = require("../utils/otp");
const bcrypt = require("bcrypt");

const verifyOTPMiddleware = async (req, res, next) => {
    const { id } = req.params;
    const { otp } = req.body;

    if (!id || !otp) {
        return response(400, "error", null, "ID dan OTP harus diisi", res);
    }

    try {
        const userId = Number(id);
        
        if (isNaN(userId)) {
            return response(400, "error", null, "ID tidak valid", res);
        }

        const user = await prisma.user.findFirst({
            where: { 
                id: userId,
                otp_code: { not: null },
                is_verified: false
            },
        });

        if (!user) {
            return response(404, "error", null, "Verifikasi tidak valid atau sudah kadaluarsa", res);
        }

        try {
            const isValid = await verifyOtp(user.email, otp);
            const isValidHash = await bcrypt.compare(otp, user.otp_code);
            
            if (!isValid || !isValidHash) {
                return response(400, "error", null, "Kode OTP tidak valid", res);
            }
        } catch (error) {
            console.error("Error during OTP verification:", error.message);
            if (error.message === "OTP has expired") {
                return response(400, "error", null, "Kode OTP sudah kadaluarsa", res);
            }
            throw error;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("OTP verification error:", error);
        return response(500, "error", null, error.message || "Terjadi kesalahan saat verifikasi OTP", res);
    }
};

module.exports = verifyOTPMiddleware;
