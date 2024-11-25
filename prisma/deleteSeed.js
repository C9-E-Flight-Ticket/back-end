const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("Starting to clear database...");

    // 1. Hapus Seats
    console.log("Deleting seats...");
    await prisma.seat.deleteMany();
    await prisma.$executeRaw`ALTER TABLE seat AUTO_INCREMENT = 1`; 
    // 2. Hapus Flights
    console.log("Deleting flights...");
    await prisma.flight.deleteMany();
    await prisma.$executeRaw`ALTER TABLE flight AUTO_INCREMENT = 1`; 

    // 3. Hapus Airlines
    console.log("Deleting airlines...");
    await prisma.airline.deleteMany();
    await prisma.$executeRaw`ALTER TABLE airline AUTO_INCREMENT = 1`;

    // 4. Hapus Airports
    console.log("Deleting airports...");
    await prisma.airport.deleteMany();
    await prisma.$executeRaw`ALTER TABLE airport AUTO_INCREMENT = 1`;

    // 5. Hapus Passengers
    console.log("Deleting passengers...");
    await prisma.passanger.deleteMany();
    await prisma.$executeRaw`ALTER TABLE passanger AUTO_INCREMENT = 1`; 

    // 6. Hapus Users
    console.log("Deleting users...");
    await prisma.user.deleteMany();
    await prisma.$executeRaw`ALTER TABLE user AUTO_INCREMENT = 1`; 

    console.log("Database cleared and IDs reset successfully!");
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
