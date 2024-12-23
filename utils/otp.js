const otpGenerator = require("otp-generator");
const transporter = require("../libs/nodemailer");
const bcrypt = require("bcrypt");
const prisma = require("../models/prismaClients");
const cron = require('node-cron');
const { getEmailSubject, getEmailTemplate } = require("../templates/emailTemplates");

const MAX_OTP_ATTEMPTS = process.env.MAX_OTP_ATTEMPTS || 3;
const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES || 1;

const OTP_TYPES = {
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PASSWORD_RESET: 'PASSWORD_RESET'
};

const sendOtp = async (email, type = OTP_TYPES.EMAIL_VERIFICATION) => {
    if (!email) {
        throw new Error("Email is required");
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                otps: {
                    where: {
                        type,
                        revokedAt: null,
                        verifiedAt: null,
                        expiresAt: {
                            gt: new Date()
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new Error("User tidak ditemukan");
        }

        const activeOtp = user.otps[0];
        if (activeOtp) {
            if (activeOtp.attempts >= MAX_OTP_ATTEMPTS) {
                throw new Error(`OTP telah diblokir. Silakan tunggu ${OTP_EXPIRY_MINUTES} menit untuk mencoba lagi`);
            }
            
            await prisma.oTP.update({
                where: { id: activeOtp.id },
                data: {
                    revokedAt: new Date()
                }
            });
        }

        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
            digits: true,
        });

        const hashedOtp = await bcrypt.hash(otp, Number(process.env.SALT_ROUNDS));
        const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000); // milisecond (60 seconds x 1000 milisecond)

        if (activeOtp) {
            await prisma.oTP.updateMany({
                where: {
                    userId: user.id,
                    type,
                    revokedAt: null
                },
                data: {
                    revokedAt: new Date()
                }
            });
        }

        const newOtp = await prisma.oTP.create({
            data: {
                code: hashedOtp,
                type,
                userId: user.id,
                expiresAt: expiryTime,
                attempts: 0
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: getEmailSubject(type),
            text: `Kode OTP Anda adalah ${otp}. Kode ini akan kadaluarsa dalam ${OTP_EXPIRY_MINUTES} menit.`,
            html: getEmailTemplate(otp, type, OTP_EXPIRY_MINUTES)
        });

        return {
            success: true,
            data: { expiresAt: expiryTime },
            message: "OTP berhasil dikirim ke email"
        };

    } catch (error) {
        // console.error("Failed to send OTP:", error);
        throw error;
    }
};

const verifyOtp = async (email, otp, type = OTP_TYPES.EMAIL_VERIFICATION) => {
    if (!email || !otp) {
        throw new Error("Email and OTP are required");
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                otps: {
                    where: {
                        type,
                        revokedAt: null,
                        verifiedAt: null,
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        const activeOtp = user?.otps[0];
        if (!user || !activeOtp) {
            throw new Error("OTP tidak valid atau sudah kadaluarsa");
        }

        const isValidOtp = await bcrypt.compare(otp, activeOtp.code);
        if (!isValidOtp) {
            const newAttemptCount = activeOtp.attempts + 1;
            const attemptsLeft = MAX_OTP_ATTEMPTS - newAttemptCount;
            
            if (newAttemptCount >= MAX_OTP_ATTEMPTS) {
                await prisma.oTP.update({
                    where: { id: activeOtp.id },
                    data: {
                        attempts: newAttemptCount,
                        revokedAt: new Date()
                    }
                });
                throw new Error("Maksimum percobaan tercapai. Silakan minta OTP baru");
            } else {
                await prisma.oTP.update({
                    where: { id: activeOtp.id },
                    data: {
                        attempts: newAttemptCount
                    }
                });
                throw new Error(`OTP tidak valid. Sisa ${attemptsLeft} percobaan lagi`);
            }
        }

        await prisma.oTP.update({
            where: { id: activeOtp.id },
            data: {
                verifiedAt: new Date()
            }
        });

        return {
            success: true,
            data: { email: user.email },
            message: "OTP berhasil diverifikasi"
        };
    } catch (error) {
        // console.error("OTP verification error:", error);
        throw error;
    }
};

if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const result = await prisma.oTP.updateMany({
                where: {
                    expiresAt: {
                        lt: now
                    },
                    revokedAt: null,
                    verifiedAt: null
                },
                data: {
                    revokedAt: now
                }
            });
            console.log(`Cleaned up ${result.count} expired OTPs`);
        } catch (error) {
            console.error('Error cleaning up expired OTPs:', error);
        }
    });
  }

module.exports = { sendOtp, verifyOtp, OTP_TYPES }; 