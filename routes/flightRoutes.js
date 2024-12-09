const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const FlightController = require("../controllers/flightController");

router.get("/search", asyncErrorHandler(FlightController.searchFlight));
router.get("/search-return", asyncErrorHandler(FlightController.searchReturnFlight));
router.get('/createFlight', asyncErrorHandler(FlightController.getCreateFlight));
router.get('/', asyncErrorHandler(FlightController.getFlights));
router.get('/:id', asyncErrorHandler(FlightController.getFlight));
router.post('/', asyncErrorHandler(FlightController.createFlight));
router.put('/:id', asyncErrorHandler(FlightController.updateFlight));
router.delete('/:id', asyncErrorHandler(FlightController.deleteFlight));


module.exports = router;
