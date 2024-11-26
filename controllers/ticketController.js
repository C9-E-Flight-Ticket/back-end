const prisma = require("../models/prismaClients");
const response = require('../utils/response')

class TicketController {
  // Get all tickets 
  static async getAllTickets(req, res) {
    try {
      const tickets = await prisma.ticket.findMany({
        where: { deleteAt: null },
        include: { passanger: true, seat: true, transaction: true },
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
        include: { passanger: true, seat: true, transaction: true },
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
      const { transactionId, seatId, passangerId } = req.body;

      // Konversi ke integer
      const ticket = await prisma.ticket.create({
        data: {
          transactionId: parseInt(transactionId, 10),
          seatId: parseInt(seatId, 10),
          passangerId: parseInt(passangerId, 10),
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
      const { transactionId, seatId, passangerId } = req.body;

      const updatedTicket = await prisma.ticket.update({
        where: { id: parseInt(id) },
        data: { transactionId, seatId, passangerId },
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

      res.status(200).json({ message: "Ticket soft deleted successfully", deletedTicket });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to soft delete ticket" });
    }
  }

  static async 
}

module.exports = TicketController;