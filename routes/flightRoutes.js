const express = require("express");
const router = express.Router();
const FlightController = require("../controllers/flightController");

// Routes
router.get("/", FlightController.searchFlight);

module.exports = router;
