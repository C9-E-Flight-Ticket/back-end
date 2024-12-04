const prisma = require("../models/prismaClients");
const response = require("../utils/response");

class AirlineController {
  static async getAirlines(req, res, next) {
    try {
      const { limit, offset, search } = req.query;
      const query = {
        take: limit ? parseInt(limit) : 10,
        skip: offset ? parseInt(offset) : 0,
        where: search
          ? {
              code: {
                contains: search,
                mode: "insensitive",
              },
            }
          : undefined,
      };

      const totalAirlines = await prisma.airline.count({ where: query.where });
      const airlines = await prisma.airline.findMany(query);

      if (!airlines.length) {
        return response(404, "failed", null, "Airline tidak ditemukan", res);
      }

      const totalPages = Math.ceil(totalAirlines / (limit || 10));
      const currentPage = offset
        ? Math.floor(parseInt(offset) / parseInt(limit)) + 1
        : 1;

      response(
        200,
        "success",
        airlines,
        "Berhasil menampilkan daftar airline",
        res,
        {
          totalItems: totalAirlines,
          currentPage,
          pageSize: limit || 10,
          totalPages,
        }
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AirlineController;
