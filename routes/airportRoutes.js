const express = require("express");
const router = express.Router();
const AirportController = require("../controllers/airportController");

router.get("/", AirportController.getAllAirports);
router.get("/:id", AirportController.getAirportById);
router.post("/", AirportController.createAirport);
router.put("/:id", AirportController.updateAirport);
router.delete("/:id", AirportController.deleteAirport);

module.exports = router;
