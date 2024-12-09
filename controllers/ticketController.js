const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const randomCode = require("otp-generator");
const { AppError } = require("../middleware/errorMiddleware");

class TicketController {

  static async getAllTransactions(req, res, next) {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: true,
          Tickets: { include: { seat: true } },
        },
      });
      response(
        200,
        "success",
        transactions,
        "Fetched all transactions successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllTickets(req, res, next) {
    try {
      const tickets = await prisma.ticket.findMany({
        where: { deleteAt: null },
        include: { passenger: true, seat: true, transaction: true },
      });
      response(
        200,
        "success",
        tickets,
        "Fetched all tickets successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await prisma.ticket.findUnique({
        where: { id: parseInt(id) },
        include: { passenger: true, seat: true, transaction: true },
      });

      if (!ticket) {
        return response(404, "failed", null, "Ticket not found", res);
      }

      response(
        200,
        "success",
        ticket,
        "Fetched ticket by ID successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async createTicket(req, res, next) {
    try {
      const { transactionId, seatId, passengerId, category } = req.body;

      if (!["Adult", "Child", "Baby"].includes(category)) {
        return next(new AppError("Invalid category value", 400));
      }

      const ticket = await prisma.ticket.create({
        data: {
          transactionId: parseInt(transactionId, 10),
          seatId: parseInt(seatId, 10),
          passengerId: parseInt(passengerId, 10),
          category,
        },
      });

      response(201, "success", ticket, "Ticket created successfully", res);
    } catch (error) {
      next(error);
    }
  }

  static async updateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionId, seatId, passengerId } = req.body;

      const updatedTicket = await prisma.ticket.update({
        where: { id: parseInt(id) },
        data: {
          transactionId: transactionId
            ? parseInt(transactionId, 10)
            : undefined,
          seatId: seatId ? parseInt(seatId, 10) : undefined,
          passengerId: passengerId ? parseInt(passengerId, 10) : undefined,
        },
      });

      response(
        200,
        "success",
        updatedTicket,
        "Ticket updated successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteTicket(req, res, next) {
    try {
      const { id } = req.params;

      const deletedTicket = await prisma.ticket.update({
        where: { id: parseInt(id) },
        data: { deleteAt: new Date() },
      });

      response(
        200,
        "success",
        {
          message: "Ticket soft deleted successfully",
          deletedTicket,
        },
        "Ticket soft deleted successfully",
        res
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TicketController;
