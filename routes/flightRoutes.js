const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const FlightController = require("../controllers/flightController");
const AuthMiddleware = require('../middleware/authMiddleware');

router.get("/search", asyncErrorHandler(FlightController.searchFlight));
router.get("/search-return", asyncErrorHandler(FlightController.searchReturnFlight));

module.exports = router;