const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const { AppError } = require("../middleware/errorMiddleware");

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

      const userId = req.user?.id;

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

  static async getAllSeats(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      const skip = (pageNumber - 1) * limitNumber;

      const seats = await prisma.seat.findMany({
        where: { deleteAt: null },
        include: {
          flight: {
            include: {
              airline: true,
              departureAirport: true,
              arrivalAirport: true,
            },
          },
        },
        skip,
        take: limitNumber,
      });

      const totalSeats = await prisma.seat.count({ where: { deleteAt: null } });
      const totalPages = Math.ceil(totalSeats / limitNumber);
  
      const pagination = {
        currentPage: pageNumber,
        totalPages,
        totalSeats,
        limit: limitNumber,
      };
  
      response(200, "success", { seats, pagination }, "Berhasil mengambil data kursi dengan paginasi.", res);
    } catch (error) {
      console.error(error);
      response(500, "error", null, "Terjadi kesalahan saat mengambil data kursi.", res);
    }
  }
  

  // READ Seat by ID
  static async getSeatById(req, res) {
    const { id } = req.params;

    try {
      const seat = await prisma.seat.findUnique({
        where: { id: parseInt(id) },
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

      if (seat && !seat.deleteAt) {
        response(200, "success", seat, "Berhasil mengambil data seat.", res);
      } else {
        response(404, "error", null, "Seat tidak ditemukan.", res);
      }
    } catch (error) {
      console.error(error);
      response(500, "error", null, "Terjadi kesalahan saat mengambil data seat.", res);
    }
  }

  // CREATE Seat
  static async createSeat(req, res) {
    const { flightId, seatNumber, seatClass, price, available } = req.body;

    try {
      const newSeat = await prisma.seat.create({
        data: {
          flightId,
          seatNumber,
          seatClass,
          price: parseFloat(price),
          available: available !== undefined ? available : true,
        },
      });

      response(201, "success", newSeat, "Seat berhasil dibuat.", res);
    } catch (error) {
      console.error(error);
      response(500, "error", null, "Terjadi kesalahan saat membuat seat.", res);
    }
  }

  // UPDATE Seat
  static async updateSeat(req, res) {
    const { id } = req.params;
    const { seatNumber, seatClass, price, available } = req.body;

    try {
      const existingSeat = await prisma.seat.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingSeat || existingSeat.deleteAt) {
        response(404, "error", null, "Seat tidak ditemukan.", res);
        return;
      }

      const updatedSeat = await prisma.seat.update({
        where: { id: parseInt(id) },
        data: {
          seatNumber,
          seatClass,
          price: parseFloat(price),
          available,
        },
      });

      response(200, "success", updatedSeat, "Seat berhasil diperbarui.", res);
    } catch (error) {
      console.error(error);
      response(500, "error", null, "Terjadi kesalahan saat memperbarui seat.", res);
    }
  }

  // DELETE Seat
  static async deleteSeat(req, res) {
    const { id } = req.params;

    try {
      await prisma.seat.update({
        where: { id: parseInt(id) },
        data: { deleteAt: new Date() },
      });

      response(200, "success", null, "Seat berhasil dihapus.", res);
    } catch (error) {
      console.error(error);
      response(500, "error", null, "Terjadi kesalahan saat menghapus seat.", res);
    }
  }
}

module.exports = SeatController;
