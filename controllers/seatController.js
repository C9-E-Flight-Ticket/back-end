const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const jwt = require("jsonwebtoken");
const { AppError } = require("../middleware/errorMiddleware");

const JWT_SECRET = process.env.JWT_SECRET;

class SeatController {
  static async getDetailFlight(req, res, next) {
    try {
      const { flightId, seatClass, adult, child, baby } = req.query;

      const flightIdsArray = Array.isArray(flightId)
        ? flightId.map((id) => parseInt(id))
        : [parseInt(flightId)];

      if (!flightIdsArray || flightIdsArray.length === 0) {
        throw new AppError("flightId harus berisi minimal satu flightId", 400);
      }

      // add jumlah views di flight
      await Promise.all(
        flightIdsArray.map(async (flightId) => {
          await prisma.flight.update({
            where: { id: flightId },
            data: {
              views: {
                increment: 1,
              },
            },
          });
        })
      );

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
        return next(new AppError("User tidak ditemukan", 404));
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
            ? seats.filter((seat) => seat.seatClass.toLocaleLowerCase() === seatClass.toLocaleLowerCase()).sort((a, b) => a.seatNumber - b.seatNumber)
            : seats.sort((a, b) => a.seatNumber - b.seatNumber),
        })
      );

      // Validate if seats are available for each flight
      if (
        filteredSeatsByFlight.every(({ seats }) => !seats || seats.length === 0)
      ) {
        throw new AppError("Tidak ada kursi yang tersedia untuk penerbangan ini", 404);
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
            subTotalPrice.adult + subTotalPrice.child + subTotalPrice.baby;

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
        total: pricesByFlight.reduce((acc, { total }) => acc + total, 0),
      };

      const datas = {
        user: user || "guest",
        flights: filteredSeatsByFlight,
        pricesByFlight,
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
      next(error);
    }
  }
}

module.exports = SeatController;
