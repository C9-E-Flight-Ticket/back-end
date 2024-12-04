const express = require("express");
const router = express.Router();
const airlineController = require("../controllers/airlineController");

router.get("/", airlineController.getAirlines);

module.exports = router;
