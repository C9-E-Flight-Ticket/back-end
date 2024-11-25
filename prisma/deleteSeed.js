const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("Starting to clear database...");

    // 1. Hapus Seats
    console.log("Deleting seats...");
    await prisma.seat.deleteMany();

    // 2. Hapus Flights
    console.log("Deleting flights...");
    await prisma.flight.deleteMany();

    // 3. Hapus Airlines
    console.log("Deleting airlines...");
    await prisma.airline.deleteMany();

    // 4. Hapus Airports
    console.log("Deleting airports...");
    await prisma.airport.deleteMany();

    // 5. Hapus Passengers
    console.log("Deleting passengers...");
    await prisma.passanger.deleteMany();

    // 6. Hapus Users
    console.log("Deleting users...");
    await prisma.user.deleteMany();

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error during clearing database:", error);
    throw error;
  }
}

clearDatabase()
  .catch((e) => {
    console.error("Error during clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
