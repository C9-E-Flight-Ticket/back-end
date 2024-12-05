const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const FlightController = require("../controllers/flightController");

router.get("/search", asyncErrorHandler(FlightController.searchFlight));
router.get("/search-return", asyncErrorHandler(FlightController.searchReturnFlight));
router.get('/', FlightController.getFlights);
router.get('/:id', FlightController.getFlight);
router.post('/', FlightController.createFlight);
router.put('/:id', FlightController.updateFlight);
router.delete('/:id', FlightController.deleteFlight);


module.exports = router;
