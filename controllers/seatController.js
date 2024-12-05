const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

class SeatController {
    // not return flight
    // GET /api/seats?flightId=101&seatClass=economy&adult=2&child=1&baby=0

    // return flight
    // GET /api/seats?flightId=101&flightId=202&seatClass=business&adult=1&child=0&baby=1
    static async getDetailFlight(req, res) {
        try {
            const { flightId, seatClass, adult, child, baby } = req.query;

            const flightIdsArray = Array.isArray(flightId)
                ? flightId.map((id) => parseInt(id))
                : [parseInt(flightId)];

            if (!flightIdsArray || flightIdsArray.length === 0) {
                response(
                    400,
                    "error",
                    null,
                    "flightId harus berisi minimal satu flightId",
                    res
                );
                return;
            }

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
                response(404, "error", null, "User  tidak ditemukan", res);
                return;
            }

            const seatsByFlight = await Promise.all(
                flightIdsArray.map(async (flightId) => {
                    const seats = await prisma.seat.findMany({
                        where: {
                            flightId: flightId,
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

                    return {
                        flightId,
                        seats,
                    };
                })
            );

            const filteredSeatsByFlight = seatsByFlight.map(
                ({ flightId, seats }) => ({
                    flightId,
                    seats: seatClass
                        ? seats.filter((seat) => seat.seatClass === seatClass)
                        : seats,
                })
            );

            // Validate if seats are available for each flight
            if (
                filteredSeatsByFlight.every(
                    ({ seats }) => !seats || seats.length === 0
                )
            ) {
                response(
                    404,
                    "error",
                    null,
                    "Tidak ada kursi yang tersedia untuk penerbangan ini",
                    res
                );
                return;
            }

            const passengerCounts = {
                adult: parseInt(adult) || 0,
                child: parseInt(child) || 0,
                baby: parseInt(baby) || 0,
            };

            const pricesByFlight = filteredSeatsByFlight.map(
                ({ flightId, seats }) => {
                    const seatPrice = seats.length > 0 ? seats[0].price : 0;

                    const subTotalPrice = {
                        adult: passengerCounts.adult * seatPrice,
                        child: passengerCounts.child * (seatPrice * 0.75),
                        baby: passengerCounts.baby * 0,
                    };

                    const totalPrice =
                        subTotalPrice.adult +
                        subTotalPrice.child +
                        subTotalPrice.baby;

                    const tax = 0.11 * totalPrice;

                    return {
                        flightId,
                        subTotalPrice,
                        tax,
                        total: totalPrice + tax,
                    };
                }
            );

            const priceAllPassenger = pricesByFlight.reduce(
                (acc, { subTotalPrice }) => {
                    acc.adult += subTotalPrice.adult;
                    acc.child += subTotalPrice.child;
                    acc.baby += subTotalPrice.baby;
                    return acc;
                },
                { adult: 0, child: 0, baby: 0 }
            );

            const prices = {
                subTotalPrice: priceAllPassenger,
                tax: pricesByFlight.reduce((acc, { tax }) => acc + tax, 0),
                total: pricesByFlight.reduce(
                    (acc, { total }) => acc + total,
                    0
                ),
            };

            const datas = {
                user: user || "guest",
                flights: filteredSeatsByFlight,
                pricesByFlight,
                priceAllPassenger,
                passengerCounts,
                prices,
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
