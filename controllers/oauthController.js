const response = require("../utils/response");
const { sendOtp, OTP_TYPES } = require("../utils/otp");
const { AppError } = require("../middleware/errorMiddleware");

class OauthController {
    static async googleCallback(req, res, next) {
        try {
            if (!req.user) {
                return next(new AppError("Unauthorized access", 401));
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
            next(error);
        }
    }

    static async googleFailure(req, res, next) {
        return next(new AppError("Google login failed", 401));
    }
}

module.exports = OauthController; 