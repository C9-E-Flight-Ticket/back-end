const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const randomCode = require("otp-generator");
const snap = require("../config/midtransConfig");

class TransactionController {
  static async createTicketTransaction(req, res) {
    try {
      const { userId, seats, passengerDetails, tax, total } = req.body;

      if (
        !userId ||
        !seats ||
        !passengerDetails ||
        seats.length === 0 ||
        passengerDetails.length === 0 ||
        seats.length !== passengerDetails.length
      ) {
        return response(
          400,
          "error",
          null,
          "Invalid input: seats and passenger details must match",
          res
        );
      }

      const availableSeats = await prisma.seat.findMany({
        where: {
          id: { in: seats },
          available: true,
        },
        include: {
          flight: {
            include: {
              airline: true,
              departureAirport: true,
              arrivalAirport: true,
            },
          },
        },
      });

      if (availableSeats.length !== seats.length) {
        return response(
          400,
          "error",
          null,
          "Some seats are not available",
          res
        );
      }

      const bookingCode = randomCode.generate(9, { specialChars: false });

      const transaction = await prisma.$transaction(async (prisma) => {
        const newTransaction = await prisma.transaction.create({
          data: {
            userId,
            bookingCode,
            tax: tax,
            totalAmmount: total,
            expiredAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
            status: "Unpaid",
          },
        });

        const createdPassengers = await Promise.all(
          passengerDetails.map(async (passengerData) => {
            return await prisma.passenger.create({
              data: {
                title: passengerData.title,
                name: passengerData.name,
                familyName: passengerData.familyName,
                dateOfBirth: new Date(passengerData.dateOfBirth),
                nationality: passengerData.nationality,
                identityNumber: passengerData.identityNumber,
                issuingCountry: passengerData.issuingCountry,
              },
            });
          })
        );

        // Create tiket untuk setiap seat dan passenger
        const createdTickets = await Promise.all(
          seats.map(async (seatId, index) => {
            const passenger = createdPassengers[index];

            return await prisma.ticket.create({
              data: {
                transactionId: newTransaction.id,
                seatId: seatId,
                passengerId: passenger.id,
                category: passengerDetails[index].category || "Adult",
              },
              include: {
                passenger: true,
                seat: {
                  include: {
                    flight: {
                      include: {
                        airline: true,
                        departureAirport: true,
                        arrivalAirport: true,
                      },
                    },
                  },
                },
              },
            });
          })
        );

        return {
          transaction: newTransaction,
          tickets: createdTickets,
          passengers: createdPassengers,
        };
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // membulatkan harga ke bilangan bulat
      const roundPrice = (price) => {
        return Math.round(parseFloat(price.toString()));
      };

      // total harga tiket dengan pembulatan
      const itemDetails = transaction.tickets.map((ticket) => {
        const basePrice = roundPrice(ticket.seat.price);

        // faktor harga berdasarkan kategori
      let priceFactor = 1;
      switch (ticket.category) {
        case 'Child':
          priceFactor = 0.75; 
          break;
        case 'Baby':
          priceFactor = 0; 
          break;
        default:
          priceFactor = 1; 
      }

      // harga dengan faktor dan pajak
      const adjustedPrice = roundPrice(basePrice * priceFactor);
      const priceWithTax = roundPrice(adjustedPrice * 1.11);

        return {
          id: ticket.id.toString(),
          price: priceWithTax, 
          quantity: 1,
          name: `${ticket.seat.flight.airline.name} - ${ticket.seat.seatNumber} (${ticket.passenger.name})`,
        };
      });

      // gross amount dari item details
      const calculatedGrossAmount = itemDetails.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const midtransParameter = {
        transaction_details: {
          order_id: bookingCode,
          gross_amount: calculatedGrossAmount,
        },
        customer_details: {
          first_name: user.name,
          email: user.email,
          phone: user.phoneNumber || "",
        },
        item_details: itemDetails,
        expiry: {
          start_time: new Date().toISOString(),
          unit: "hour",
          duration: 1 
        }
      };

      const midtransToken = await snap.createTransaction(midtransParameter);

      response(
        201,
        "success",
        {
          transaction: transaction.transaction,
          tickets: transaction.tickets,
          passengers: transaction.passengers,
          bookingCode: transaction.transaction.bookingCode,
          midtransToken: midtransToken.token,
          redirectUrl: midtransToken.redirect_url,
          debugInfo: {
            calculatedGrossAmount,
            originalTotal: total,
            itemDetails: midtransParameter.item_details,
          },
        },
        "Transaction, passengers, and tickets created successfully",
        res
      );
    } catch (error) {
      console.error("Error creating ticket transaction:", error);
      response(500, "error", null, "Internal server error", res);
    }
  }

  static async handleMidtransCallback(req, res) {
    try {
      const { order_id, transaction_status, fraud_status } = req.body;
  
      let newStatus;
      switch (transaction_status) {
        case "pending":
          newStatus = "Unpaid";
          break;
        case "capture":
        case "settlement":
          if (fraud_status === "accept" || !fraud_status) {
            newStatus = "Issued";
          } else {
            newStatus = "Cancelled";
          }
          break;
        case "cancel":
        case "expire":
          newStatus = "Cancelled";
          break;
      }
  
      // Transaction update
      const transaction = await prisma.transaction.update({
        where: { bookingCode: order_id },
        data: {
          status: newStatus,
          paymentMethod: req.body.payment_type,
        },
      });
  
      // Jika transaksi dibatalkan (expired/cancel)
      if (newStatus === "Cancelled") {
        // Kembalikan seat menjadi available
        await prisma.seat.updateMany({
          where: { 
            Ticket: {
              some: {
                transactionId: transaction.id
              }
            }
          },
          data: { 
            available: true 
          }
        });
  
        // Hapus tiket terkait
        await prisma.ticket.deleteMany({
          where: { 
            transactionId: transaction.id 
          }
        });
      }
  
      // Jika transaksi berhasil
      if (newStatus === "Issued") {
        await prisma.ticket.updateMany({
          where: { transactionId: transaction.id },
          data: {
            seat: {
              update: {
                available: false,
              },
            },
          },
        });
      }
  
      res.status(200).send("OK");
    } catch (error) {
      console.error("Midtrans callback error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactionStatus(req, res) {
    try {
      const { bookingCode } = req.params;
      const transaction = await prisma.transaction.findUnique({
        where: { bookingCode },
        include: {
          Tickets: {
            include: {
              seat: {
                include: {
                  flight: {
                    include: {
                      departureAirport: true,
                      arrivalAirport: true,
                      airline: true,
                    },
                  },
                },
              },
              passenger: true,
            },
          },
          user: true,
        },
      });

      response(
        200,
        "success",
        transaction,
        "Transaction status retrieved successfully",
        res
      );
    } catch (error) {
      console.error("Error getting transaction status:", error);
      response(500, "error", null, "Internal server error", res);
    }
  }

  static async getAllTransactions(req, res) {
    try {
      const { bookingCode, departureDate } = req.query; 
  
      const query = {};
      if (bookingCode) {
        query.bookingCode = bookingCode; 
      }
  
      if (departureDate) {
        const parsedDate = new Date(departureDate);
        if (isNaN(parsedDate.getTime())) {
          return response(400, "error", null, "Invalid departure date", res);
        }
  
        query.Tickets = {
          some: {
            seat: {
              flight: {
                departureDate: {
                  gte: parsedDate, 
                },
              },
            },
          },
        };
      }
  
      const transactions = await prisma.transaction.findMany({
        where: query,
        include: {
          Tickets: {
            include: {
              seat: {
                include: {
                  flight: {
                    include: {
                      departureAirport: true,
                      arrivalAirport: true,
                      airline: true,
                    },
                  },
                },
              },
              passenger: true,
            },
          },
          // user: true,
        },
      });
  
      response(
        200,
        "success",
        transactions,
        "Transactions retrieved successfully",
        res
      );
    } catch (error) {
      console.error("Error getting all transactions:", error);
      response(500, "error", null, "Internal server error", res);
    }
  }
}

module.exports = TransactionController;
