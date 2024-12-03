const express = require("express");
const router = express.Router();
const FlightController = require("../controllers/flightController");

router.get("/search", FlightController.searchFlight);

module.exports = router;
