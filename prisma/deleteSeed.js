const { PrismaClient } = require("@prisma/client");
const imagekit = require("../libs/imagekit");

const prisma = new PrismaClient();

async function deleteImageFromImageKit(fileId) {
  if (!fileId) {
    console.warn("No fileId provided for deletion.");
    return;
  }
  try {
    await imagekit.deleteFile(fileId);
    console.log(`Deleted image with fileId: ${fileId}`);
  } catch (error) {
    console.error(`Error deleting image with fileId ${fileId}:`, error);
  }
}

async function clearDatabase() {
  try {
    console.log("Starting to clear database...");

    // 1. Hapus Transactions
    console.log("Deleting transactions...");
    await prisma.transaction.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Transaction_id_seq" RESTART WITH 1`;

    // 2. Hapus Tickets
    console.log("Deleting tickets...");
    await prisma.ticket.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Ticket_id_seq" RESTART WITH 1`;

    // 3. Hapus Seats
    console.log("Deleting seats...");
    await prisma.seat.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Seat_id_seq" RESTART WITH 1`;

    // 4. Hapus Flights
    console.log("Deleting flights...");
    await prisma.flight.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Flight_id_seq" RESTART WITH 1`;

    // 5. Hapus Airlines dan gambar
    console.log("Deleting airlines...");
    const airlines = await prisma.airline.findMany();
    for (const airline of airlines) {
      await deleteImageFromImageKit(airline.fileId);
    }
    await prisma.airline.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Airline_id_seq" RESTART WITH 1`;

    // 6. Hapus Airports dan gambar
    console.log("Deleting airports...");
    const airports = await prisma.airport.findMany();
    for (const airport of airports) {
      await deleteImageFromImageKit(airport.fileId);
    }
    await prisma.airport.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Airport_id_seq" RESTART WITH 1`;

    // 7. Hapus Passengers
    console.log("Deleting passengers...");
    await prisma.passenger.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Passenger_id_seq" RESTART WITH 1`;

    // 8. Hapus Notifications
    console.log("Deleting notifications...");
    await prisma.notification.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."Notification_id_seq" RESTART WITH 1`;

    // 9. Hapus OTPs
    console.log("Deleting OTPs...");
    await prisma.oTP.deleteMany();
    await prisma.$executeRaw`ALTER SEQUENCE capstone."OTP_id_seq" RESTART WITH 1`;

    // 10. Hapus Users
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