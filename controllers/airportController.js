const prisma = require("../models/prismaClients");
const response = require("../utils/response");

class AirportController {
    
    static async getAllAirports(req, res) {
        try {
            const airports = await prisma.airport.findMany({
                where: { deleteAt: null },
            });
            response(200, "success", airports, "Berhasil mengambil semua bandara.", res);
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat mengambil data bandara.", res);
        }
    }

    
    static async getAirportById(req, res) {
        const { id } = req.params;
        try {
            const airport = await prisma.airport.findUnique({
                where: { id: parseInt(id) },
            });
            if (airport && !airport.deleteAt) {
                response(200, "success", airport, "Berhasil mengambil data bandara.", res);
            } else {
                response(404, "error", null, "Bandara tidak ditemukan.", res);
            }
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat mengambil data bandara.", res);
        }
    }

    static async createAirport(req, res) {
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
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat membuat bandara.", res);
        }
    }

    static async updateAirport(req, res) {
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
                response(404, "error", null, "Bandara tidak ditemukan.", res);
                return;
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
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat memperbarui bandara.", res);
        }
    }
}

module.exports = AirportController;
