const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const AirportController = require("../controllers/airportController");

router.get("/", asyncErrorHandler(AirportController.getAllAirports));
router.get("/:id", asyncErrorHandler(AirportController.getAirportById));
router.post("/", asyncErrorHandler(AirportController.createAirport));
router.put("/:id", asyncErrorHandler(AirportController.updateAirport));
router.delete("/:id", asyncErrorHandler(AirportController.deleteAirport));

module.exports = router;
