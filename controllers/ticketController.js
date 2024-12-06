const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const randomCode = require("otp-generator");

class TicketController {

  static async getAllTransactions(req, res) {
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
      console.error(error);
      response(500, "failed", null, "Unable to fetch transactions", res);
    }
  }

  static async getAllTickets(req, res) {
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
      console.error(error);
      response(500, "failed", null, "Unable to fetch tickets", res);
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

      response(
        200,
        "success",
        ticket,
        "Fetched ticket by ID successfully",
        res
      );
    } catch (error) {
      console.error(error);
      response(500, "failed", null, "Unable to fetch ticket", res);
    }
  }

  static async createTicket(req, res) {
    try {
      const { transactionId, seatId, passengerId, category } = req.body;

      if (!["Adult", "Child", "Baby"].includes(category)) {
        return response(400, "failed", null, "Invalid category value", res);
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
      console.error(error);
      response(500, "failed", null, "Unable to create ticket", res);
    }
  }

  static async updateTicket(req, res) {
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
      console.error(error);
      response(500, "failed", null, "Unable to update ticket", res);
    }
  }

  static async deleteTicket(req, res) {
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
      console.error(error);
      response(500, "failed", null, "Unable to soft delete ticket", res);
    }
  }
}

module.exports = TicketController;
