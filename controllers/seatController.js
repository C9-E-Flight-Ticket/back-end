const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

class SeatController {
    static async getDetailFlight(req, res) {
        try {
            const { flightId, seatClass, adult, child, baby } = req.query;

            let token = req.cookies?.token;
            let userId = null;

            if (token) {
                jwt.verify(token, JWT_SECRET, (err, decoded) => {
                    if (err) {
                        console.error("Token tidak valid:", err.message);
                    } else {
                        userId = decoded.userId;
                    }
                });
            }

            let user = null;

            if (userId) {
                user = await prisma.user.findUnique({
                    where: { id: userId },
                });
            }

            if (userId && !user) {
                response(404, "error", null, "User tidak ditemukan", res);
                return;
            }

            const seats = await prisma.seat.findMany({
                where: {
                    flightId: {
                        equals: parseInt(flightId),
                    },
                },
                include: {
                    flight: {
                        include: {
                            airline: true,
                            departureAirport: true,
                            arrivalAirport: true,
                        },
                    },
                },
            });

            if (!seats || seats.length === 0) {
                response(
                    404,
                    "error",
                    null,
                    "Tidak ada kursi yang tersedia untuk penerbangan ini",
                    res
                );
                return;
            }

            const filteredSeats = seatClass
                ? seats.filter((seat) => seat.seatClass === seatClass)
                : seats;

            if (!filteredSeats || filteredSeats.length === 0) {
                response(
                    404,
                    "error",
                    null,
                    "Tidak ada kursi yang cocok dengan kelas yang diminta",
                    res
                );
                return;
            }

            const passengerCounts = {
                adult: parseInt(adult) || 0,
                child: parseInt(child) || 0,
                baby: parseInt(baby) || 0,
            };

            const seatPrice =
                filteredSeats.length > 0 ? filteredSeats[0].price : 0;

            const subTotalPrice = {
                adult: passengerCounts.adult * seatPrice,
                child: passengerCounts.child * (seatPrice * 0.75),
                baby: passengerCounts.baby * 0,
            };

            const totalPrice =
                subTotalPrice.adult + subTotalPrice.child + subTotalPrice.baby;

            const tax = 0.11 * parseInt(totalPrice);

            const total = totalPrice + tax;

            const datas = {
                user: user || "guest",
                seats,
                passengerCounts,
                subTotalPrice,
                tax,
                total,
            };

            response(
                200,
                "success",
                datas,
                "Berhasil menampilkan detail penerbangan",
                res
            );
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan pada server", res);
        }
    }
}

module.exports = SeatController;
