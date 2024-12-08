const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const AuthMiddleware = require("../middleware/authMiddleware");
const CookieMiddleware = require("../middleware/cookieMiddleware");

class LoginController {
    // Login user
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return response(401, "error", null, "Alamat email tidak terdaftar!", res);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return response(401, "error", null, "Maaf, kata sandi salah", res);
            }

            if (!user.is_verified) {
                return response(401, "error", null, "Akun belum terverifikasi. Silakan verifikasi email Anda.", res);
            }

            const token = AuthMiddleware.generateToken(user);
            CookieMiddleware.setTokenCookie(res, token);

            console.log("Cookie set:", token);

            response(200, "success", null, "Berhasil login", res);
        } catch (error) {
            console.error("Login error:", error);
            response(500, "error", null, "Terjadi kesalahan saat login", res);
        }
    }

    // Logout
    static async logout(req, res) {
        try {
            CookieMiddleware.clearTokenCookie(res);

            response(200, "success", null, "Berhasil logout", res);
        } catch (error) {
            console.error("Logout error:", error);
            response(500, "error", null, "Terjadi kesalahan saat logout", res);
        }
    }
}

module.exports = LoginController;
