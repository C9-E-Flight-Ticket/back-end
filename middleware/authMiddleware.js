const jwt = require('jsonwebtoken');
const prisma = require("../models/prismaClients");
const response = require("../utils/response");

class AuthMiddleware {
    static async verifyAuthentication(req, res, next) {
        try {
            if (req.headers['authorization'] || req.cookies.access_token) {
                let token;
                const authHeader = req.headers['authorization'];

                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.split(' ')[1];
                } else if (req.cookies && req.cookies.access_token) {
                    token = req.cookies.access_token;
                }

                if (token) {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                    
                    const user = await prisma.user.findUnique({
                        where: { 
                            id: decoded.userId,
                            AND: [
                                { is_verified: true },
                                { deleteAt: null }
                            ]
                        }
                    });

                    if (user) {
                        req.user = user;
                        return next();
                    }
                }
            }

            if (req.isAuthenticated()) {
                return next();
            }

            return response(401, "error", null, "Authentication required", res);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return response(401, "error", null, "Token telah kadaluarsa", res);
            }
            if (error instanceof jwt.JsonWebTokenError) {
                return response(401, "error", null, "Token tidak valid", res);
            }
            console.error("Auth error:", error);
            return response(500, "error", null, "Terjadi kesalahan pada autentikasi", res);
        }
    }

    static adminOnly(req, res, next) {
        try {
            if (req.user.role !== 'ADMIN') {
                return response(403, "error", null, "Akses ditolak. Hanya admin yang diizinkan.", res);
            }
            next();
        } catch (error) {
            console.error("Admin auth error:", error);
            return response(500, "error", null, "Terjadi kesalahan pada autentikasi admin", res);
        }
    }

    static generateToken(user) {
        return jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
        );
    }
}

module.exports = AuthMiddleware; 