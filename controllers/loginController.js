const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");
const AuthMiddleware = require("../middleware/authMiddleware");

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

            const { accessToken, refreshToken, refreshTokenExpiry } = AuthMiddleware.generateTokens(user);

            await AuthMiddleware.saveRefreshToken(user.id, refreshToken, refreshTokenExpiry);

            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            };

            response(200, "success", userData, "Berhasil login", res);
        } catch (error) {
            console.error("Login error:", error);
            response(500, "error", null, "Terjadi kesalahan saat login", res);
        }
    }

    // Refresh token
    static async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return response(400, "error", null, "Refresh token harus disediakan", res);
        }

        try {
            const user = await AuthMiddleware.verifyRefreshToken(refreshToken);
            await AuthMiddleware.revokeRefreshToken(refreshToken);

            const { accessToken: newAccessToken, refreshToken: newRefreshToken, refreshTokenExpiry } = AuthMiddleware.generateTokens(user);

            await AuthMiddleware.saveRefreshToken(user.id, newRefreshToken, refreshTokenExpiry);

            response(200, "success", {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }, "Token berhasil diperbarui", res);

        } catch (error) {
            console.error("Token refresh error:", error);
            if (error.message === 'Invalid refresh token') {
                return response(401, "error", null, "Refresh token tidak valid atau kadaluarsa", res);
            }
            return response(500, "error", null, "Terjadi kesalahan saat memperbarui token", res);
        }
    }

    // Logout
    static async logout(req, res) {
        const { refreshToken } = req.body;

        try {
            if (refreshToken) {
                await AuthMiddleware.revokeRefreshToken(refreshToken);
            } else {
                await AuthMiddleware.revokeAllUserRefreshTokens(req.user.id);
            }

            response(200, "success", null, "Berhasil logout", res);
        } catch (error) {
            console.error("Logout error:", error);
            response(500, "error", null, "Terjadi kesalahan saat logout", res);
        }
    }
}

module.exports = LoginController;
