const prisma = require("../models/prismaClients");
const response = require("../utils/response");

class FlightController {
    static async searchFlight(req, res) {
        try {
            const { departure, destination, seatClass, limit, offset } = req.query;

            const query = {
                where: {
                    AND: [],
                },
                include: {
                    airline: true,
                    departureAirport: true,
                    arrivalAirport: true,
                    seats: true,
                },
                take: limit ? parseInt(limit) : undefined,
                skip: offset ? parseInt(offset) : undefined,
            };

            if (departure) {
                query.where.AND.push({
                    departureAirport: {
                        name: {
                            contains: departure,
                            mode: "insensitive",
                        },
                    },
                });
            }

            if (destination) {
                query.where.AND.push({
                    arrivalAirport: {
                        name: {
                            contains: destination,
                            mode: "insensitive",
                        },
                    },
                });
            }

            if (seatClass) {
                query.where.AND.push({
                    seats: {
                        some: {
                            available: true,
                            seatClass: seatClass,
                        }
                    }
                })
            }

            const flights = await prisma.flight.findMany(query);
            response(200, "success", flights, "")
        } catch (error) {}
    }
}
