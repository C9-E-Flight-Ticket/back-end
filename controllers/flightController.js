const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const { AppError } = require("../middleware/errorMiddleware");

class FlightController {
  static async searchFlight(req, res, next) {
    try {
      const {
        arrivalContinent,
        departureCity,
        arrivalCity,
        departureDate,
        seatClass,
        limit,
        offset,
        sort,
        homepage,
      } = req.query;

      global.displayedFlights = [];

      // Konversi ke Set untuk menghindari duplikasi
      const displayedFlightPairsSet = new Set(
        global.displayedFlights.map(
          (pair) => `${pair.departureAirportId}-${pair.arrivalAirportId}`
        )
      );

      // Reset jika terlalu banyak pasangan yang disimpan
      if (displayedFlightPairsSet.size > 100) {
        displayedFlightPairsSet.clear();
        global.displayedFlights = [];
      }

      const query = {
        where: {
          AND: [],
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
        orderBy: [],
      };

      // Filter berdasarkan parameter yang diterima
      if (arrivalContinent) {
        query.where.AND.push({
          arrivalAirport: {
            continent: {
              contains: arrivalContinent,
              mode: "insensitive",
            },
          },
        });
      }

      if (departureCity) {
        query.where.AND.push({
          departureAirport: {
            city: {
              contains: departureCity,
              mode: "insensitive",
            },
          },
        });
      }

      if (arrivalCity) {
        query.where.AND.push({
          arrivalAirport: {
            city: {
              contains: arrivalCity,
              mode: "insensitive",
            },
          },
        });
      }

      if (departureDate) {
        const startOfDay = new Date(departureDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(departureDate);
        endOfDay.setHours(23, 59, 59, 999);

        query.where.AND.push({
          departureTime: {
            gte: startOfDay,
            lt: endOfDay,
          },
        });
      }

      if (seatClass) {
        query.where.AND.push({
          seats: {
            some: {
              available: true,
              seatClass: seatClass,
            },
          },
        });
      }

      if (homepage === "true") {
        // Hindari rute yang sudah pernah ditampilkan
        if (displayedFlightPairsSet.size > 0) {
          query.where.AND.push({
            NOT: {
              OR: Array.from(displayedFlightPairsSet).map((pairKey) => {
                const [departureAirportId, arrivalAirportId] =
                  pairKey.split("-");
                return {
                  departureAirportId: parseInt(departureAirportId),
                  arrivalAirportId: parseInt(arrivalAirportId),
                };
              }),
            },
          });
        }

        // Include harga kursi termurah
        query.include.seats = {
          where: {
            available: true,
            seatClass: "Economy",
          },
          take: 1,
          select: {
            price: true,
          },
        };

        // Sorting berdasarkan views
        if (sort === "views") {
          query.orderBy.push({ views: "desc" });
        }
      }

      // Hapus AND kosong
      if (query.where.AND.length === 0) {
        delete query.where.AND;
      }

      // Sorting tambahan
      if (sort) {
        switch (sort) {
          case "price":
            query.orderBy.push({ price: "asc" });
            break;
          case "duration":
            query.orderBy.push({ duration: "asc" });
            break;
          case "earlierDeparture":
            query.orderBy.push({ departureTime: "asc" });
            break;
          case "latestDeparture":
            query.orderBy.push({ departureTime: "desc" });
            break;
          case "earlierArrival":
            query.orderBy.push({ arrivalTime: "asc" });
            break;
          case "latestArrival":
            query.orderBy.push({ arrivalTime: "desc" });
            break;
        }
      }

      // Ambil penerbangan
      const flights = await prisma.flight.findMany(query);

      // Filter untuk homepage - hanya rute baru
      const uniqueFlights =
        homepage === "true"
          ? flights.filter((flight) => {
              const routeKey = `${flight.departureAirportId}-${flight.arrivalAirportId}`;
              const isNewRoute = !displayedFlightPairsSet.has(routeKey);

              if (isNewRoute) {
                displayedFlightPairsSet.add(routeKey);
              }

              return isNewRoute;
            })
          : flights;

      // Update global state dengan pasangan rute baru
      global.displayedFlights = Array.from(displayedFlightPairsSet).map(
        (pairKey) => {
          const [departureAirportId, arrivalAirportId] = pairKey.split("-");
          return {
            departureAirportId: parseInt(departureAirportId),
            arrivalAirportId: parseInt(arrivalAirportId),
          };
        }
      );

      const paginatedFlights =
        homepage === "true" && limit
          ? uniqueFlights.slice(
              offset ? parseInt(offset) : 0,
              offset ? parseInt(offset) + parseInt(limit) : parseInt(limit)
            )
          : limit
          ? uniqueFlights.slice(
              offset ? parseInt(offset) : 0,
              offset ? parseInt(offset) + parseInt(limit) : parseInt(limit)
            )
          : uniqueFlights;

      // Hitung total dan pagination dengan mempertimbangkan limit untuk homepage
      const totalFlights = uniqueFlights.length;
      const pageSize =
        homepage === "true" && limit
          ? Math.min(parseInt(limit), totalFlights)
          : limit
          ? parseInt(limit)
          : totalFlights;

      const totalPages = Math.ceil(totalFlights / pageSize);

      // Hitung currentPage berdasarkan offset manual untuk homepage
      const currentPage =
        homepage === "true"
          ? offset
            ? Math.floor(parseInt(offset) / parseInt(limit)) + 1
            : 1
          : offset
          ? Math.floor(parseInt(offset) / pageSize) + 1
          : 1;

      const pagination = {
        totalItems: totalFlights,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
      };

      // Tidak ada penerbangan
      if (totalFlights === 0) {
        return next(new AppError("Tidak ada penerbangan yang ditemukan", 404));
      }

      // Kirim response
      response(
        200,
        "success",
        paginatedFlights,
        "Berhasil menampilkan daftar penerbangan",
        res,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  static async searchReturnFlight(req, res, next) {
    try {
      const {
        departureCity,
        arrivalCity,
        returnDate,
        seatClass,
        limit,
        offset,
        sort,
      } = req.query;

      const query = {
        where: {
          AND: [],
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
        take: limit ? parseInt(limit) : undefined,
        skip: offset ? parseInt(offset) : undefined,
        orderBy: [],
      };

      if (arrivalCity) {
        query.where.AND.push({
          departureAirport: {
            city: {
              contains: arrivalCity,
              mode: "insensitive",
            },
          },
        });
      }

      if (departureCity) {
        query.where.AND.push({
          arrivalAirport: {
            city: {
              contains: departureCity,
              mode: "insensitive",
            },
          },
        });
      }

      if (returnDate) {
        const startOfDay = new Date(returnDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(returnDate);
        endOfDay.setHours(23, 59, 59, 999);

        query.where.AND.push({
          departureTime: {
            gte: startOfDay,
            lt: endOfDay,
          },
        });
      }

      if (seatClass) {
        query.where.AND.push({
          seats: {
            some: {
              available: true,
              seatClass: seatClass,
            },
          },
        });
      }

      if (query.where.AND.length === 0) {
        delete query.where.AND;
      }

      if (sort) {
        switch (sort) {
          case "price":
            query.orderBy.push({ price: "asc" });
            break;
          case "duration":
            query.orderBy.push({ duration: "asc" });
            break;
          case "earlierDeparture":
            query.orderBy.push({ departureTime: "asc" });
            break;
          case "latestDeparture":
            query.orderBy.push({ departureTime: "desc" });
            break;
          case "earlierArrival":
            query.orderBy.push({ arrivalTime: "asc" });
            break;
          case "latestArrival":
            query.orderBy.push({ arrivalTime: "desc" });
            break;
          default:
            break;
        }
      }

      const totalReturnFlights = await prisma.flight.count({
        where: query.where,
      });

      const returnFlights = await prisma.flight.findMany(query);

      if (totalReturnFlights === 0) {
        return next(
          new AppError("Tidak ada penerbangan kembali yang ditemukan", 404)
        );
      }

      const totalPages = limit
        ? Math.ceil(totalReturnFlights / parseInt(limit))
        : 1;

      const pagination = {
        totalItems: totalReturnFlights,
        currentPage: offset
          ? Math.floor(parseInt(offset) / parseInt(limit)) + 1
          : 1,
        pageSize: limit ? parseInt(limit) : totalReturnFlights,
        totalPages: totalPages,
      };

      response(
        200,
        "success",
        returnFlights,
        "Berhasil menampilkan daftar penerbangan kembali",
        res,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  static async createFlight(req, res, next) {
    try {
      const {
        airlineId,
        departureAirportId,
        arrivalAirportId,
        flightNumber,
        departureTime,
        arrivalTime,
      } = req.body;

      if (
        !airlineId ||
        !departureAirportId ||
        !arrivalAirportId ||
        !flightNumber ||
        !departureTime ||
        !arrivalTime
      ) {
        return next(new AppError("Semua field wajib diisi", 400));
      }

      const newFlight = await prisma.flight.create({
        data: {
          airlineId,
          departureAirportId,
          arrivalAirportId,
          flightNumber,
          departureTime: new Date(departureTime),
          arrivalTime: new Date(arrivalTime),
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });

      return response(201, "success", newFlight, "Flight berhasil dibuat", res);
    } catch (error) {
      next(error);
    }
  }

  static async getFlights(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;

      let where = { deleteAt: null };

      if (search) {
        where.OR = [
          { flightNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      const [total, flights] = await Promise.all([
        prisma.flight.count({ where }),
        prisma.flight.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
          },
          orderBy: {
            departureTime: "asc",
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return response(
        200,
        "success",
        flights,
        "Berhasil menampilkan daftar penerbangan",
        res,
        {
          totalItems: total,
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalPages,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  static async getFlight(req, res, next) {
    try {
      const { id } = req.params;

      const flight = await prisma.flight.findUnique({
        where: { id: parseInt(id) },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
          seats: true,
        },
      });

      if (!flight || flight.deleteAt) {
        return next(new AppError("Flight tidak ditemukan", 404));
      }

      return response(
        200,
        "success",
        flight,
        "Berhasil menampilkan detail penerbangan",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCreateFlight(req, res, next) {
    try {
      const airlines = await prisma.airline.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      const airports = await prisma.airport.findMany({
        select: {
          id: true,
          name: true,
          city: true,
        },
      });

      const departureAirports = airports;
      const arrivalAirports = airports;

      const data = {
        airlines,
        departureAirports,
        arrivalAirports,
      };

      return response(
        200,
        "success",
        data,
        "Data untuk membuat flight berhasil diambil",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateFlight(req, res, next) {
    try {
      const { id } = req.params;
      const {
        airlineId,
        departureAirportId,
        arrivalAirportId,
        flightNumber,
        departureTime,
        arrivalTime,
      } = req.body;

      const existingFlight = await prisma.flight.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingFlight) {
        return next(new AppError("Flight tidak ditemukan", 404));
      }

      const updatedFlight = await prisma.flight.update({
        where: { id: parseInt(id) },
        data: {
          airlineId: airlineId || existingFlight.airlineId,
          departureAirportId:
            departureAirportId || existingFlight.departureAirportId,
          arrivalAirportId: arrivalAirportId || existingFlight.arrivalAirportId,
          flightNumber: flightNumber || existingFlight.flightNumber,
          departureTime: departureTime
            ? new Date(departureTime)
            : existingFlight.departureTime,
          arrivalTime: arrivalTime
            ? new Date(arrivalTime)
            : existingFlight.arrivalTime,
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });

      return response(
        200,
        "success",
        updatedFlight,
        "Flight berhasil diperbarui",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteFlight(req, res, next) {
    try {
      const { id } = req.params;

      const existingFlight = await prisma.flight.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingFlight) {
        return next(new AppError("Flight tidak ditemukan", 404));
      }

      await prisma.flight.update({
        where: { id: parseInt(id) },
        data: {
          deleteAt: new Date(),
        },
      });

      return response(200, "success", null, "Flight berhasil dihapus", res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FlightController;
