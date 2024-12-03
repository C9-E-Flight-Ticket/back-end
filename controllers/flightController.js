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
  
        const totalFlights = await prisma.flight.count({
          where: query.where,
        });
  
        const flights = await prisma.flight.findMany(query);
  
        if (totalFlights === 0) {
          return response(
            404,
            "failed",
            null,
            "Tidak ada penerbangan yang ditemukan berdasarkan filter",
            res
          );
        }
  
        const totalPages = limit ? Math.ceil(totalFlights / parseInt(limit)) : 1;
  
        const pagination = {
          totalItems: totalFlights,
          currentPage: offset
            ? Math.floor(parseInt(offset) / parseInt(limit)) + 1
            : 1,
          pageSize: limit ? parseInt(limit) : totalFlights,
          totalPages: totalPages,
        };
  
        response(
          200,
          "success",
          flights,
          "Berhasil menampilkan daftar penerbangan",
          res,
          pagination
        );
      } catch (error) {
        next(error)
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
          return response(
            404,
            "failed",
            null,
            "Tidak ada penerbangan kembali yang ditemukan berdasarkan filter",
            res
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
        next(error)
      }
    }
  }
  
  module.exports = FlightController;
  