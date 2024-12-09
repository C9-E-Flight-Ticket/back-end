const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const { AppError } = require("../middleware/errorMiddleware");

class AirportController {
    
    static async getAllAirports(req, res, next) {
        try {
            const airports = await prisma.airport.findMany({
                where: { deleteAt: null },
            });
            response(200, "success", airports, "Berhasil mengambil semua bandara.", res);
        } catch (error) {
            next(error);
        }
    }

    
    static async getAirportById(req, res, next) {
        const { id } = req.params;
        try {
            const airport = await prisma.airport.findUnique({
                where: { id: parseInt(id) },
            });
            if (airport && !airport.deleteAt) {
                response(200, "success", airport, "Berhasil mengambil data bandara.", res);
            } else {
                throw new AppError("Bandara tidak ditemukan.", 404);
            }
        } catch (error) {
            next(error);
        }
    }

    static async createAirport(req, res, next) {
        const {
            name,
            code,
            city,
            terminalName,
            terminalCategory,
            continent,
            urlImage,
            fileId,
        } = req.body;

        try {
            const newAirport = await prisma.airport.create({
                data: {
                    name,
                    code,
                    city,
                    terminalName: terminalName || "Terminal 1A",
                    terminalCategory: terminalCategory || "Domestic",
                    continent,
                    urlImage,
                    fileId,
                },
            });
            response(201, "success", newAirport, "Bandara berhasil dibuat.", res);
        } catch (error) {
            next(error);
        }
    }

    static async updateAirport(req, res, next) {
        const { id } = req.params;
        const {
            name,
            code,
            city,
            terminalName,
            terminalCategory,
            continent,
            urlImage,
            fileId,
        } = req.body;

        try {
           
            const existingAirport = await prisma.airport.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingAirport || existingAirport.deleteAt) {
                throw new AppError("Bandara tidak ditemukan.", 404);
            }

            const updatedAirport = await prisma.airport.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    code,
                    city,
                    terminalName,
                    terminalCategory,
                    continent,
                    urlImage,
                    fileId,
                },
            });
            response(200, "success", updatedAirport, "Bandara berhasil diperbarui.", res);
        } catch (error) {
            next(error);
        }
    }
    
    static async deleteAirport(req, res, next) {
        const { id } = req.params;
        try {
            
            const existingAirport = await prisma.airport.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingAirport || existingAirport.deleteAt) {
                throw new AppError("Bandara tidak ditemukan.", 404);
            }

            await prisma.airport.update({
                where: { id: parseInt(id) },
                data: { deleteAt: new Date() },
            });
            response(200, "success", null, "Bandara berhasil dihapus.", res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AirportController;
