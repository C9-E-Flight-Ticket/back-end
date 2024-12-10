const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const AuthMiddleware = require("../middleware/authMiddleware");
const CookieMiddleware = require("../middleware/cookieMiddleware");
const { AppError } = require("../middleware/errorMiddleware");

class LoginController {
    // Login user
    static async login(req, res, next) {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return next(new AppError("Email tidak terdaftar", 404));
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return next(new AppError("Maaf, kata sandi salah", 401));
            }

            if (!user.is_verified) {
                return next(new AppError("Akun belum terverifikasi. Silakan verifikasi email Anda.", 401));
            }

            const token = AuthMiddleware.generateToken(user);
            CookieMiddleware.setTokenCookie(res, token);

            // console.log("Cookie set:", token);

            response(200, "success", token, "Berhasil login", res);
        } catch (error) {
            next(error);
        }
    }

    // Logout
    static async logout(req, res, next) {
        try {
            CookieMiddleware.clearTokenCookie(res);
            response(200, "success", null, "Berhasil logout", res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LoginController;
