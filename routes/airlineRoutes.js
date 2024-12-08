const express = require("express");
const router = express.Router();
const airlineController = require("../controllers/airlineController");

router.get("/get", airlineController.getAirlines);
router.post("/create", airlineController.createAirline);
router.put("/update/:id", airlineController.updateAirline);
router.delete("/delete/:id", airlineController.deleteAirline);

module.exports = router;
