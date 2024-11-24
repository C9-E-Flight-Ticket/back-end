const { PrismaClient } = require("@prisma/client");
const { userData } = require("./datas/userData");
const { airlineData } = require("./datas/airlineData");
const { airportData } = require("./datas/airportData");
const { passengerData } = require("./datas/passengerData");
const { flightData } = require("./datas/flightData");
const { generateSeats } = require("./datas/seatData");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting seed...");

    // 1. Seed Users
    console.log("Seeding users...");
    await prisma.user.createMany({
      data: userData,
      skipDuplicates: true,
    });

    // 2. Seed Passengers
    console.log("Seeding passengers...");
    await prisma.passanger.createMany({
      data: passengerData,
      skipDuplicates: true,
    });

    // 3. Seed Airports
    console.log("Seeding airports...");
    await prisma.airport.createMany({
      data: airportData,
      skipDuplicates: true,
    });

    // 4. Seed Airlines
    console.log("Seeding airlines...");
    await prisma.airline.createMany({
      data: airlineData,
      skipDuplicates: true,
    });

    // 5. Seed Flights
    console.log("Seeding flights...");
    for (const flight of flightData) {
      await prisma.flight.create({
        data: {
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          airline: {
            connect: { id: flight.airlineId }
          },
          departureAirport: {
            connect: { id: flight.departureAirportId }
          },
          arrivalAirport: {
            connect: { id: flight.arrivalAirportId }
          }
        },
      });
    }

    // 6. Seed Seats
    console.log("Seeding seats...");
    const flights = await prisma.flight.findMany();
    for (const flight of flights) {
      const seats = generateSeats(flight.id);
      await prisma.seat.createMany({
        data: seats,
        skipDuplicates: true,
      });
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
