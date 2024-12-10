const prisma = require("../models/prismaClients");
const response = require("../utils/response");


class PassengerController {
    static async getAllPassengers(req, res) {
        try {
            const passengers = await prisma.passenger.findMany({
                where: { deleteAt: null },
            });
            response(200, "success", passengers, "Berhasil mengambil semua penumpang.", res);
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat mengambil data penumpang.", res);
        }
    }

    static async getPassengerById(req, res) {
        const { id } = req.params;
        try {
            const passenger = await prisma.passenger.findUnique({
                where: { id: parseInt(id) },
            });

            if (passenger && !passenger.deleteAt) {
                response(200, "success", passenger, "Berhasil mengambil data penumpang.", res);
            } else {
                response(404, "error", null, "Penumpang tidak ditemukan.", res);
            }
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat mengambil data penumpang.", res);
        }
    }

    static async getCreatePassengerData(req, res) {
        try {
            const titles = ["Mr", "Mrs"];
            const nationalities = await prisma.passenger.groupBy({
                by: ['nationality'],
            });

            const issuingCountries = await prisma.passenger.groupBy({
                by: ['issuingCountry'],
            });

            const data = {
                titles,
                nationalities: nationalities.map((item) => item.nationality),
                issuingCountries: issuingCountries.map((item) => item.issuingCountry),
            };

            response(200, "success", data, "Berhasil mendapatkan data untuk input penumpang.", res);
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat mendapatkan data untuk input penumpang.", res);
        }
    }

    static async createPassenger(req, res) {
        const {
            title,
            name,
            familyName,
            dateOfBirth,
            nationality,
            identityNumber,
            issuingCountry,
            validUntil,
        } = req.body;

        try {
            const newPassenger = await prisma.passenger.create({
                data: {
                    title,
                    name,
                    familyName,
                    dateOfBirth: new Date(dateOfBirth),
                    nationality,
                    identityNumber,
                    issuingCountry,
                    validUntil: validUntil ? new Date(validUntil) : null,
                },
            });

            response(201, "success", newPassenger, "Penumpang berhasil dibuat.", res);
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat membuat penumpang.", res);
        }
    }

    static async updatePassenger(req, res) {
        const { id } = req.params;
        const {
            title,
            name,
            familyName,
            dateOfBirth,
            nationality,
            identityNumber,
            issuingCountry,
            validUntil,
        } = req.body;

        try {
            const existingPassenger = await prisma.passenger.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingPassenger || existingPassenger.deleteAt) {
                response(404, "error", null, "Penumpang tidak ditemukan.", res);
                return;
            }

            const updatedPassenger = await prisma.passenger.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    name,
                    familyName,
                    dateOfBirth: new Date(dateOfBirth),
                    nationality,
                    identityNumber,
                    issuingCountry,
                    validUntil: validUntil ? new Date(validUntil) : null,
                },
            });

            response(200, "success", updatedPassenger, "Penumpang berhasil diperbarui.", res);
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat memperbarui penumpang.", res);
        }
    }

    static async deletePassenger(req, res) {
        const { id } = req.params;

        try {
            const existingPassenger = await prisma.passenger.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingPassenger || existingPassenger.deleteAt) {
                response(404, "error", null, "Penumpang tidak ditemukan.", res);
                return;
            }

            const deletedPassenger = await prisma.passenger.update({
                where: { id: parseInt(id) },
                data: { deleteAt: new Date() },
            });

            response(200, "success", deletedPassenger, "Penumpang berhasil dihapus.", res);
        } catch (error) {
            console.error(error);
            response(500, "error", null, "Terjadi kesalahan saat menghapus penumpang.", res);
        }
    }
}

module.exports = PassengerController;