const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const AuthMiddleware = require('../middleware/authMiddleware');

const TransactionController = require("../controllers/transactionController");
const FlightController = require("../controllers/flightController");
const AirportController = require("../controllers/airportController");
const airlineController = require("../controllers/airlineController");
const NotificationController = require("../controllers/notificationController");

router.use(AuthMiddleware.verifyAuthentication);
router.use(AuthMiddleware.adminOnly);

// transaction
router.get("/transaction/history", asyncErrorHandler(TransactionController.getAllTransactionsAdmin));
router.delete('/transaction/:id/soft-delete', asyncErrorHandler(TransactionController.softDeleteTransaction));
router.patch('/transaction/:id/restore', asyncErrorHandler(TransactionController.restoreTransaction));


// flight
router.get('/flight/createFlight', asyncErrorHandler(FlightController.getCreateFlight));
router.get('/flight', asyncErrorHandler(FlightController.getFlights));
router.get('/flight/:id', asyncErrorHandler(FlightController.getFlight));
router.post('/flight', asyncErrorHandler(FlightController.createFlight));
router.put('/flight/:id', asyncErrorHandler(FlightController.updateFlight));
router.delete('/flight/:id', asyncErrorHandler(FlightController.deleteFlight));

// airline
router.get("/airline/get", asyncErrorHandler(airlineController.getAirlines));
router.post("/airline/create", asyncErrorHandler(airlineController.createAirline));
router.put("/airline/update/:id", asyncErrorHandler(airlineController.updateAirline));
router.delete("/airline/delete/:id", asyncErrorHandler(airlineController.deleteAirline));

// airport
router.get("/airport", asyncErrorHandler(AirportController.getAllAirports));
router.get("/airport/:id", asyncErrorHandler(AirportController.getAirportById));
router.post("/airport/", asyncErrorHandler(AirportController.createAirport));
router.put("/airport/:id", asyncErrorHandler(AirportController.updateAirport));
router.delete("/airport/:id", asyncErrorHandler(AirportController.deleteAirport));

// notification
router.get('/notification', asyncErrorHandler(NotificationController.getAllNotificationsForAdmin));
router.delete('/notification/:id', asyncErrorHandler(NotificationController.deleteNotificationForAdmin));
router.post('/notification/send-notification', NotificationController.sendNotificationToUser);
router.post('/notification/broadcast-notification', NotificationController.broadcastNotificationToAllUsers);

module.exports = router;
