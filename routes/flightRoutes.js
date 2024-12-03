const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const FlightController = require("../controllers/flightController");

router.get("/search", asyncErrorHandler(FlightController.searchFlight));
router.get("/search-return", asyncErrorHandler(FlightController.searchReturnFlight));

module.exports = router;
