const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

class SeatController {
    static async getDetailFlight() {
        try {
            const { flightId, seatClass, adult, child, baby } = req.query;

            let token = req.cookies.token;
            let userId

            if (token) {
                jwt.verify(token, JWT_SECRET, (err, decoded) => {
                    if (err) {
                        response(403, "error", null, "Token tidak valid", res);
                    }
                    userId = decoded.userId
                })
            }

            const user = await prisma.user.findUnique({
                where: {userId}
            })

            if (!user) {
                response(404, "error", null, "User tidak ditemukan", res);
            }

            const seats = await prisma.seat.findMany({
                where: { flightId },
                include: {
                    flight: true,
                    airline: true,
                    airport: true
                }
            });

            const filteredSeats = seats.filter((seat) => seat.seatClass === seatClass);

            const passengerCounts = {
                adult: parseInt(adult) || 0,
                child: parseInt(child) || 0,
                baby: parseInt(baby) || 0
            }

            const seatPrice = filteredSeats.length > 0 ? filteredSeats[0].price : 0;

            const subTotalPrice = {
                adult: passengerCounts.adult * seatPrice,
                child: passengerCounts.child * (seatPrice * 0.2), 
                baby: passengerCounts.baby * 0,
            };

            const totalPrice = subTotalPrice.adult + subTotalPrice.child + subTotalPrice.baby;

            const datas = {
                user,
                seats,
                passengerCounts,
                subTotalPrice,
                totalPrice
            }

            response(200, "success", datas, "Berhasil menampilkan detail penerbangan", res)


        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan pada server", res);
        }
    }
}
