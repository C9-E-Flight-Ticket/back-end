const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const { AppError } = require("../middleware/errorMiddleware");

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

  static async createAirline(req, res, next) {
    try {
      const {
        name,
        code,
        baggage,
        cabinBaggage,
        entertainment,
        urlImage,
        fileId,
      } = req.body;

      if (!name || !code) {
        return response(
          400,
          "failed",
          null,
          "Nama dan kode airline wajib diisi",
          res
        );
      }

      const newAirline = await prisma.airline.create({
        data: {
          name,
          code,
          baggage: baggage || 20,
          cabinBaggage: cabinBaggage || 7,
          entertainment: entertainment || "In Flight Entertainment",
          urlImage,
          fileId,
        },
      });

      response(
        201, 
        "success", 
        newAirline, 
        "Airline berhasil ditambahkan", 
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateAirline(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        code,
        baggage,
        cabinBaggage,
        entertainment,
        urlImage,
        fileId,
      } = req.body;

      const airline = await prisma.airline.findUnique({
        where: { id: parseInt(id) },
      });

      if (!airline) {
        return response(
          404, 
          "failed", 
          null, 
          "Airline tidak ditemukan", 
          res
        );
      }

      const updatedAirline = await prisma.airline.update({
        where: { id: parseInt(id) },
        data: {
          name: name || airline.name,
          code: code || airline.code,
          baggage: baggage || airline.baggage,
          cabinBaggage: cabinBaggage || airline.cabinBaggage,
          entertainment: entertainment || airline.entertainment,
          urlImage: urlImage || airline.urlImage,
          fileId: fileId || airline.fileId,
        },
      });

      response(
        200,
        "success",
        updatedAirline,
        "Airline berhasil diperbarui",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteAirline(req, res, next) {
    try {
      const { id } = req.params;
  
      const airline = await prisma.airline.findUnique({ where: { id: parseInt(id) } });
  
      if (!airline) {
        return response(
          404, 
          "failed", 
          null, 
          "Airline tidak ditemukan", 
          res);
      }
  
      
      const updatedAirline = await prisma.airline.update({
        where: { id: parseInt(id) },
        data: {
          deleteAt: new Date(), 
        },
      });
  
      response(
        200, 
        "success", 
        updatedAirline, 
        "Airline berhasil dihapus", 
        res
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AirlineController;
