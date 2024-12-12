const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const AuthMiddleware = require('../middleware/authMiddleware');

const TransactionController = require("../controllers/transactionController");
const TicketController = require("../controllers/ticketController");
const FlightController = require("../controllers/flightController");
const AirportController = require("../controllers/airportController");
const airlineController = require("../controllers/airlineController");

router.use(AuthMiddleware.verifyAuthentication);
router.use(AuthMiddleware.adminOnly);

// transaction
router.get("/transaction/history", asyncErrorHandler(TransactionController.getAllTransactionsAdmin));
router.delete('/transaction/:id/soft-delete', asyncErrorHandler(TransactionController.softDeleteTransaction));
router.patch('/transaction/:id/restore', asyncErrorHandler(TransactionController.restoreTransaction));


// ticket
router.get("/ticket/", asyncErrorHandler(TicketController.getAllTickets));
router.get("/ticket/:id", asyncErrorHandler(TicketController.getTicketById));
router.post("/ticket/", asyncErrorHandler(TicketController.createTicket));
router.patch("/ticket/:id", asyncErrorHandler(TicketController.updateTicket));
router.delete("/ticket/:id", asyncErrorHandler(TicketController.deleteTicket));

// flight
router.get('flight/createFlight', asyncErrorHandler(FlightController.getCreateFlight));
router.get('flight/', asyncErrorHandler(FlightController.getFlights));
router.get('flight/:id', asyncErrorHandler(FlightController.getFlight));
router.post('flight/', asyncErrorHandler(FlightController.createFlight));
router.put('flight/:id', asyncErrorHandler(FlightController.updateFlight));
router.delete('flight/:id', asyncErrorHandler(FlightController.deleteFlight));

// airline
router.get("airline/get", asyncErrorHandler(airlineController.getAirlines));
router.post("airline/create", asyncErrorHandler(airlineController.createAirline));
router.put("airline/update/:id", asyncErrorHandler(airlineController.updateAirline));
router.delete("airline/delete/:id", asyncErrorHandler(airlineController.deleteAirline));

// airport
router.get("airport/", asyncErrorHandler(AirportController.getAllAirports));
router.get("airport/:id", asyncErrorHandler(AirportController.getAirportById));
router.post("airport/", asyncErrorHandler(AirportController.createAirport));
router.put("airport/:id", asyncErrorHandler(AirportController.updateAirport));
router.delete("airport/:id", asyncErrorHandler(AirportController.deleteAirport));



module.exports = router;