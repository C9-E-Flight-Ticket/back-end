const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const TicketController = require("../controllers/ticketController");

router.get("/", asyncErrorHandler(TicketController.getAllTickets));
router.get("/:id", asyncErrorHandler(TicketController.getTicketById));
router.post("/", asyncErrorHandler(TicketController.createTicket));
router.patch("/:id", asyncErrorHandler(TicketController.updateTicket));
router.delete("/:id", asyncErrorHandler(TicketController.deleteTicket));

module.exports = router;
