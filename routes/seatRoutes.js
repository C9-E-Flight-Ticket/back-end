const express = require("express");
const router = express.Router();
const SeatController = require("../controllers/seatController");

router.get("/detail-flight", SeatController.getDetailFlight);

module.exports = router;
