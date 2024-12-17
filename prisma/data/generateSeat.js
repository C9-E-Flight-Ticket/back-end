const { populateSeatsForAllFlights } = require("./seatData");

populateSeatsForAllFlights().then(() => {
  console.log("Seats population completed.");
  process.exit(0);
}).catch((error) => {
  console.error("Error populating seats:", error);
  process.exit(1);
});