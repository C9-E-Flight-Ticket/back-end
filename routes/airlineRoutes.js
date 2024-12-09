const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const airlineController = require("../controllers/airlineController");

router.get("/get", asyncErrorHandler(airlineController.getAirlines));
router.post("/create", asyncErrorHandler(airlineController.createAirline));
router.put("/update/:id", asyncErrorHandler(airlineController.updateAirline));
router.delete("/delete/:id", asyncErrorHandler(airlineController.deleteAirline));

module.exports = router;
