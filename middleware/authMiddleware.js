const jwt = require('jsonwebtoken');
const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const crypto = require('crypto');

class AuthMiddleware {
    static async verifyToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return response(401, "error", null, "Access token tidak ditemukan", res);
            }

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

            if (!user) {
                return response(401, "error", null, "User tidak valid", res);
            }

            req.user = user;
            next();
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

    static async adminOnly(req, res, next) {
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

    static generateTokens(user) {
        const accessToken = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenExpiry = new Date(Date.now() + (parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000));

        return {
            accessToken,
            refreshToken,
            refreshTokenExpiry
        };
    }

    static async saveRefreshToken(userId, refreshToken, expiresAt) {
        try {
            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: userId,
                    expiresAt: expiresAt
                }
            });
        } catch (error) {
            console.error('Error saving refresh token:', error);
            throw error;
        }
    }

    static async verifyRefreshToken(refreshToken) {
        const token = await prisma.refreshToken.findUnique({
            where: {
                token: refreshToken,
                revokedAt: null,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: true
            }
        });

        if (!token || !token.user || token.user.deleteAt !== null || !token.user.is_verified) {
            throw new Error('Invalid refresh token');
        }

        return token.user;
    }

    static async revokeRefreshToken(refreshToken) {
        try {
            await prisma.refreshToken.update({
                where: {
                    token: refreshToken
                },
                data: {
                    revokedAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error revoking refresh token:', error);
            throw error;
        }
    }

    static async revokeAllUserRefreshTokens(userId) {
        try {
            await prisma.refreshToken.updateMany({
                where: {
                    userId: userId,
                    revokedAt: null
                },
                data: {
                    revokedAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error revoking user refresh tokens:', error);
            throw error;
        }
    }
}

module.exports = AuthMiddleware; 