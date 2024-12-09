const response = require("../utils/response");
const { sendOtp, OTP_TYPES } = require("../utils/otp");

class OauthController {
    static async googleCallback(req, res) {
        try {
            if (!req.user) {
                return response(401, "error", null, "Unauthorized access", res);
            }

            const user = req.user;
            
            if (!user.is_verified) {
                await sendOtp(user.email, OTP_TYPES.EMAIL_VERIFICATION);
                
                return response(200, "success", {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                }, "Login berhasil. Silakan verifikasi email Anda", res);
            }

            return response(200, "success", {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    accessToken: user.accessToken,
                }
            }, "Login berhasil", res);

        } catch (error) {
            console.error("Google callback error:", error);
            return response(500, "error", null, "Terjadi kesalahan saat login dengan Google", res);
        }
    }

    static async googleFailure(req, res) {
        return response(401, "error", null, "Gagal login dengan Google", res);
    }
}

module.exports = OauthController; 