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

    
}

module.exports = AirportController;
