const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        console.log("Starting to clear database...");

        // 1. Hapus Seats
        console.log("Deleting seats...");
        await prisma.seat.deleteMany();
        await prisma.$executeRaw`ALTER SEQUENCE capstone."Seat_id_seq" RESTART WITH 1`; 

        // 2. Hapus Flights
        console.log("Deleting flights...");
        await prisma.flight.deleteMany();
        await prisma.$executeRaw`ALTER SEQUENCE capstone."Flight_id_seq" RESTART WITH 1`; 

        // 3. Hapus Airlines
        console.log("Deleting airlines...");
        await prisma.airline.deleteMany();
        await prisma.$executeRaw`ALTER SEQUENCE capstone."Airline_id_seq" RESTART WITH 1`; 

        // 4. Hapus Airports
        console.log("Deleting airports...");
        await prisma.airport.deleteMany();
        await prisma.$executeRaw`ALTER SEQUENCE capstone."Airport_id_seq" RESTART WITH 1`; 

        // 5. Hapus Passengers
        console.log("Deleting passengers...");
        await prisma.passanger.deleteMany();
        await prisma.$executeRaw`ALTER SEQUENCE capstone."Passanger_id_seq" RESTART WITH 1`; 

        // 6. Hapus Users
        console.log("Deleting users...");
        await prisma.user.deleteMany();
        await prisma.$executeRaw`ALTER SEQUENCE capstone."User_id_seq" RESTART WITH 1`; 

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
