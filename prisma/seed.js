const { PrismaClient } = require("@prisma/client");
const { userData } = require("./datas/userData");
const { airlineData } = require("./datas/airlineData");
const { airportData } = require("./datas/airportData");
const { passengerData } = require("./datas/passengerData");
const { flightData } = require("./datas/flightData");
const { generateSeats } = require("./datas/seatData");
const fs = require("fs").promises;

const prisma = new PrismaClient();
const imagekit = require("../libs/imagekit");

const uploadImage = async (filePath, fileName) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const stringFile = fileBuffer.toString("base64");

    const response = await imagekit.upload({
      file: stringFile,
      fileName: fileName,
    });

    return {
      urlImage: response.url,
      fileId: response.fileId,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

async function main() {
  try {
    console.log("Starting seed...");

    // // 1. Seed Users
    console.log("Seeding users...");
    await prisma.user.createMany({
      data: userData,
      skipDuplicates: true,
    });

    // // 2. Seed Passengers
    console.log("Seeding passengers...");
    await prisma.passenger.createMany({
      data: passengerData,
      skipDuplicates: true,
    });

    // // 3. Seed Airports
    console.log("Seeding airports...");
    const uploadedAirports = [];
    for (const airport of airportData) {
      console.log(`Uploading image for airport: ${airport.name}`);
      const uploadResult = await uploadImage(
        airport.localImagePath,
        airport.name
      );
      uploadedAirports.push({
        id: airport.id,
        name: airport.name,
        code: airport.code,
        city: airport.city,
        terminalName: airport.terminalName,
        terminalCategory: airport.terminalCategory,
        continent: airport.continent,
        urlImage: uploadResult.urlImage,
        fileId: uploadResult.fileId,
      });
    }
    await prisma.airport.createMany({
      data: uploadedAirports,
      skipDuplicates: true,
    });

    // // 4. Seed Airlines
    console.log("Seeding airlines...");
    const uploadedAirlines = [];
    for (const airline of airlineData) {
      console.log(`Uploading image for airline: ${airline.name}`);
      const uploadResult = await uploadImage(
        airline.localImagePath,
        airline.name
      );
      uploadedAirlines.push({
        id: airline.id,
        name: airline.name,
        code: airline.code,
        baggage: airline.baggage,
        cabinBaggage: airline.cabinBaggage,
        entertainment: airline.entertainment,
        urlImage: uploadResult.urlImage,
        fileId: uploadResult.fileId,
      });
    }
    await prisma.airline.createMany({
      data: uploadedAirlines,
      skipDuplicates: true,
    });

    // 5. Seed Flights
    console.log("Seeding flights...");
    const seededFlights = [];
    for (const flight of flightData) {
      const seededFlight = await prisma.flight.create({
        data: {
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          airline: {
            connect: { id: flight.airlineId },
          },
          departureAirport: {
            connect: { id: flight.departureAirportId },
          },
          arrivalAirport: {
            connect: { id: flight.arrivalAirportId },
          },
        },
      });
      seededFlights.push(seededFlight);
    }

    // 6. Seed Seats
    console.log("Seeding seats...");
    for (const flight of seededFlights) {
      const seats = generateSeats(flight);
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
