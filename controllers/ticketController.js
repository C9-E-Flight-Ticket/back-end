const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const randomCode = require("otp-generator");

class TicketController {
    static async createTicketOrder(req, res) {
        const { seats, passengers, totalPrice, userId } = req.body;

        if (!seats || !passengers || seats.length === 0 || passengers.length === 0) {
            response(
                400,
                "failed",
                null,
                "Seats and passengers data are required.",
                res
            );
        }

        const expiredAt = new Date();
        expiredAt.setHours(expiredAt.getHours() + 1);

        const bookingCode = randomCode.generate(9, { specialChars: false });

        const tax = 0.11 * parseInt(totalPrice);

        const transaction = await prisma.transaction.create({
            data: {
                userId: parseInt(userId),
                bookingCode,
                tax: tax,
                totalAmmount: parseInt(totalPrice) + tax,
            },
        });

        const passengerData = passengers.map((passenger) => ({
            title: passenger.title,
            name: passenger.name,
            familyName: passenger.familyName || null,
            dateOfBirth: new Date(passenger.dateOfBirth),
            nationality: passenger.nationality,
            identityNumber: passenger.identityNumber,
            issuingCountry: passenger.issuingCountry,
            validUntil: passenger.validUntil ? new Date(passenger.validUntil) : null,
        }));

        const createdPassengers = await prisma.passenger.createMany({
            data: passengerData,
        });

        const passengerIds = await prisma.passenger.findMany({
            where: { name: { in: passengers.map((p) => p.name) } }, 
            select: { id: true },
        });

        const ticketData = seats.map((seat, index) => ({
            transactionId: transaction.id,
            seatId: seat.id,
            passengerId: passengerIds[index].id,
            category: passengers[index].category, 
        }));

        await prisma.ticket.createMany({
            data: ticketData,
        });

        await prisma.seat.updateMany({
            where: { id: { in: seats.map((seat) => seat.id) } },
            data: { available: false },
        });

        response(201, "success", bookingCode, "Tickets successfully created", res)
    }

    static async getAllTickets(req, res) {
        try {
            const tickets = await prisma.ticket.findMany({
                where: { deleteAt: null },
                include: { passenger: true, seat: true, transaction: true },
            });
            response(200, "success", tickets, " Get all tickets successfully ", res);
        } catch (error) {
            console.error(error);
            response(500, "failed", null, "Get all tickets failed", res);
        }
    }

    static async getTicketById(req, res) {
        try {
            const { id } = req.params;
            const ticket = await prisma.ticket.findUnique({
                where: { id: parseInt(id) },
                include: { passenger: true, seat: true, transaction: true },
            });

            if (!ticket) {
                return response(404, "failed", null, "Ticket not found", res);
            }

            response(200, "success", ticket, " Get all tickets by id successfully ", res);
        } catch (error) {
            console.error(error);
            response(500, "failed", null, "Get all tickets by id failed", res);
        }
    }

    // Create a new ticket
    static async createTicket(req, res) {
        try {
            const { transactionId, seatId, passengerId, category } = req.body;

            // Konversi ke integer
            const ticket = await prisma.ticket.create({
                data: {
                    transactionId: parseInt(transactionId, 10),
                    seatId: parseInt(seatId, 10),
                    passengerId: parseInt(passengerId, 10),
                    category: category,
                },
            });

            response(201, "success", ticket, "create tickets successfully ", res);
        } catch (error) {
            console.error(error);
            response(500, "failed", null, "create tickets failed", res);
        }
    }

    // Update a ticket
    static async updateTicket(req, res) {
        try {
            const { id } = req.params;
            const { transactionId, seatId, passengerId } = req.body;

            const updatedTicket = await prisma.ticket.update({
                where: { id: parseInt(id) },
                data: { transactionId, seatId, passengerId },
            });

            response(200, "success", updatedTicket, "update tickets successfully ", res);
        } catch (error) {
            console.error(error);
            response(500, "failed", null, "update tickets failed", res);
        }
    }

    // Soft delete a ticket
    static async deleteTicket(req, res) {
        try {
            const { id } = req.params;

            const deletedTicket = await prisma.ticket.update({
                where: { id: parseInt(id) },
                data: { deleteAt: new Date() },
            });

            response(200, "success", deletedTicket, "delete tickets successfully ", res);
        } catch (error) {
            console.error(error);
            response(500, "failed", null, "delete tickets failed", res);
        }
    }

    static async;
}

module.exports = TicketController;
