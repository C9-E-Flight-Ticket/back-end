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

        // Fetch passenger IDs
        const passengerIds = await prisma.passenger.findMany({
            where: { name: { in: passengers.map((p) => p.name) } }, 
            select: { id: true },
        });

        const ticketData = seats.map((seat, index) => ({
            transactionId: transaction.id,
            seatId: seat.id,
            passengerId: passengerIds[index].id,
            category: passengers[index].category, // Adult, Child, Baby
        }));

        await prisma.ticket.createMany({
            data: ticketData,
        });

        await prisma.seat.updateMany({
            where: { id: { in: seats.map((seat) => seat.id) } },
            data: { available: false },
        });

        response(200, "success", bookingCode, "Tickets successfully created", res)
    }

    // Get all tickets
    static async getAllTickets(req, res) {
        try {
            const tickets = await prisma.ticket.findMany({
                where: { deleteAt: null },
                include: { passenger: true, seat: true, transaction: true },
            });
            res.status(200).json(tickets);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Unable to fetch tickets" });
        }
    }

    // Get a ticket by ID
    static async getTicketById(req, res) {
        try {
            const { id } = req.params;
            const ticket = await prisma.ticket.findUnique({
                where: { id: parseInt(id) },
                include: { passenger: true, seat: true, transaction: true },
            });

            if (!ticket) {
                return res.status(404).json({ error: "Ticket not found" });
            }

            res.status(200).json(ticket);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Unable to fetch ticket" });
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

            res.status(201).json(ticket);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Unable to create ticket" });
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

            res.status(200).json(updatedTicket);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Unable to update ticket" });
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

            res.status(200).json({
                message: "Ticket soft deleted successfully",
                deletedTicket,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Unable to soft delete ticket" });
        }
    }

    static async;
}

module.exports = TicketController;
