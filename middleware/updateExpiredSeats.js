const prisma = require("../models/prismaClients");

const updateExpiredSeats = async (req, res, next) => {
  try {
    const now = new Date();
    await prisma.seat.updateMany({
      where: {
        flight: {
          arrivalTime: {
            lt: now,
          },
        },
        available: false,
      },
      data: {
        available: true,
      },
    });
    next();
  } catch (error) {
    console.error("Error updating expired seats:", error);
    next(error);
  }
};

module.exports = updateExpiredSeats;