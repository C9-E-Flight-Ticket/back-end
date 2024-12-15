const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const randomCode = require("otp-generator");
const snap = require("../config/midtransConfig");
const { AppError } = require("../middleware/errorMiddleware");

class TransactionController {
  static async createTicketTransaction(req, res, next) {
    try {
      const { seats, passengerDetails, tax, total } = req.body;

      const userId = req.user?.id;

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        return next(new AppError("User not found", 404));
      }

      // Validasi input lainnya
      if (
        !seats ||
        !passengerDetails ||
        seats.length === 0 ||
        passengerDetails.length === 0
      ) {
        return next(new AppError("Invalid input", 400));
      }

      if (
        seats.length < passengerDetails.length ||
        seats.length > passengerDetails.length * 2
      ) {
        return next(
          new AppError(
            "Invalid input: Jumlah kursi tidak sesuai dengan jumlah penumpang",
            400
          )
        );
      }

      const bookingCode = randomCode.generate(9, { specialChars: false });

      const transaction = await prisma.$transaction(async (prisma) => {
        // Ambil kursi yang tersedia
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
          throw new AppError("Beberapa kursi tidak tersedia", 400);
        }

        // Gunakan connect untuk menghubungkan user
        const newTransaction = await prisma.transaction.create({
          data: {
            user: {
              connect: { id: userId },
            },
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
            // Tentukan index penumpang berdasarkan jumlah kursi dan penumpang
            const passengerIndex =
              passengerDetails.length > 1
                ? index % passengerDetails.length
                : index;

            const passenger = createdPassengers[passengerIndex];

            return await prisma.ticket.create({
              data: {
                transactionId: newTransaction.id,
                seatId: seatId,
                passengerId: passenger.id,
                category: passengerDetails[passengerIndex].category || "Adult",
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
          case "Child":
            priceFactor = 0.75;
            break;
          case "Baby":
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
      next(error);
    }
  }

  static async handleMidtransCallback(req, res, next) {
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
  
      await prisma.$transaction(async (prisma) => {
        const transaction = await prisma.transaction.update({
          where: { bookingCode: order_id },
          data: {
            status: newStatus,
            paymentMethod: req.body.payment_type,
          },
        });
  
        if (newStatus === "Cancelled") {
            await prisma.transaction.update({
            where: { bookingCode: order_id },
            data: {
              status: newStatus,
            },
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

          await prisma.transaction.update({
            where: { bookingCode: order_id },
            data: {
              status: newStatus,
            },
          });
        }
      });
  
      res.status(200).send("OK");
    } catch (error) {
      console.error("Midtrans callback error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactionStatus(req, res, next) {
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
      next(error);
    }
  }

  static async getAllTransactionsByUser(req, res, next) {
    try {
      const { flightNumber, startDate, endDate } = req.query;
  
      const userId = req.user?.id;
  
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }
  
      const query = {
        userId: userId,
      };
  
      if (flightNumber) {
        query.Tickets = {
          some: {
            seat: {
              flight: {
                flightNumber: {
                  contains: flightNumber,
                  mode: "insensitive",
                },
              },
            },
          },
        };
      }
  
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
  
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return next(new AppError("Invalid date range", 400));
        }
  
        // Menggunakan departureTime untuk memfilter penerbangan dalam rentang tanggal
        query.Tickets = {
          ...query.Tickets,
          some: {
            ...query.Tickets?.some,
            seat: {
              ...query.Tickets?.some?.seat,
              flight: {
                ...query.Tickets?.some?.seat?.flight,
                departureTime: {
                  gte: parsedStartDate,
                  lte: new Date(parsedEndDate.getTime() + 24 * 60 * 60 * 1000 - 1), // Akhir hari
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
          user: true,
        },
        orderBy: {
          createAt: "desc",
        },
      });
  
      // Hitung total transaksi
      const totalTransactions = transactions.length;
  
      response(
        200,
        "success",
        transactions,
        `${totalTransactions} transactions retrieved successfully`,
        res,
        {
          totalTransactions,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllTransactionsAdmin(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        startDate,
        endDate,
        status,
        minAmount,
        maxAmount,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const query = {
        AND: [
          // Filter pencarian global
          search
            ? {
                OR: [
                  { bookingCode: { contains: search, mode: "insensitive" } },
                  { user: { name: { contains: search, mode: "insensitive" } } },
                  {
                    user: { email: { contains: search, mode: "insensitive" } },
                  },
                ],
              }
            : {},

          // Filter status transaksi
          status ? { status: status } : {},

          // Filter rentang tanggal
          startDate && endDate
            ? {
                createdAt: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              }
            : {},

          // Filter rentang nominal
          minAmount && maxAmount
            ? {
                totalPrice: {
                  gte: parseFloat(minAmount),
                  lte: parseFloat(maxAmount),
                },
              }
            : {},
        ],
      };

      const totalTransactions = await prisma.transaction.count({
        where: query,
      });

      const transactions = await prisma.transaction.findMany({
        where: query,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
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
          deletedAt: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: skip,
        take: limitNumber,
      });

      const statistics = await prisma.transaction.aggregate({
        _count: { id: true },
        _sum: { totalPrice: true },
        where: query,
      });

      response(
        200,
        "success",
        transactions,
        "Transactions retrieved successfully",
        res,
        {
          pagination: {
            totalTransactions,
            totalPages: Math.ceil(totalTransactions / limitNumber),
            currentPage: pageNumber,
            itemsPerPage: limitNumber,
          },
          statistics: {
            totalTransactionCount: statistics._count.id,
            totalTransactionValue: statistics._sum.totalPrice || 0,
          },
        }
      );
    } catch (error) {
      next(error);
    }
  }

  static async generateTransactionPDF(req, res, next) {
    try {
      const { bookingCode } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError("Unauthorized: User not authenticated", 401));
      }

      const transaction = await prisma.transaction.findUnique({
        where: {
          bookingCode,
          userId,
        },
        include: {
          Tickets: {
            include: {
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
              passenger: true,
            },
          },
          user: true,
        },
      });

      if (!transaction) {
        return next(
          new AppError("Transaction not found or unauthorized access", 404)
        );
      }

      // console.log(`User ${userId} accessing transaction ${bookingCode}`);

      if (transaction.userId !== userId) {
        return next(
          new AppError(
            "Unauthorized: You do not have access to this transaction",
            403
          )
        );
      }

      if (transaction.status !== "Issued") {
        return next(
          new AppError(
            "Tickets can only be printed if the transaction status is 'Issued'",
            400
          )
        );
      }

      const tickets = transaction.Tickets || [];
      if (tickets.length === 0) {
        return next(new AppError("No tickets found for this transaction", 404));
      }

      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.addPage([600, 800]);
      const margin = 50;
      let y = 750;

      // Header
      page.drawText("Transaction Details", {
        x: margin,
        y,
        size: 20,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 30;

      page.drawText(`Booking Code: ${transaction.bookingCode}`, {
        x: margin,
        y,
        size: 14,
        font: fontRegular,
      });
      y -= 20;

      page.drawText(`Payment Status: ${transaction.status}`, {
        x: margin,
        y,
        size: 14,
        font: fontRegular,
        color: transaction.status === "Issued" ? rgb(0, 0.5, 0) : rgb(1, 0, 0),
      });
      y -= 20;

      page.drawText(`Total Amount: Rp ${transaction.totalAmmount || "0"}`, {
        x: margin,
        y,
        size: 14,
        font: fontRegular,
      });
      y -= 30;

      tickets.forEach((ticket, index) => {
        page.drawText(`Ticket ${index + 1}`, {
          x: margin,
          y,
          size: 16,
          font: fontBold,
        });
        y -= 20;

        page.drawText(`Passenger: ${ticket.passenger?.name || "N/A"}`, {
          x: margin,
          y,
          size: 12,
          font: fontRegular,
        });
        y -= 15;

        page.drawText(`Seat: ${ticket.seat?.seatNumber || "N/A"}`, {
          x: margin,
          y,
          size: 12,
          font: fontRegular,
        });
        y -= 15;

        page.drawText(
          `Route: ${ticket.seat?.flight?.departureAirport?.name || "N/A"} -> ${
            ticket.seat?.flight?.arrivalAirport?.name || "N/A"
          }`,
          {
            x: margin,
            y,
            size: 12,
            font: fontRegular,
          }
        );
        y -= 15;

        page.drawText(
          `Departure: ${
            ticket.seat?.flight?.departureTime
              ? new Date(ticket.seat.flight.departureTime).toLocaleString()
              : "N/A"
          }`,
          {
            x: margin,
            y,
            size: 12,
            font: fontRegular,
          }
        );
        y -= 10;

        // Garis Pemisah
        page.drawLine({
          start: { x: margin, y },
          end: { x: 550, y },
          thickness: 1,
          color: rgb(0.5, 0.5, 0.5),
        });
        y -= 10;

        y -= 10;
        // Cek jika halaman penuh
        if (y < 50) {
          page.addPage([600, 800]);
          y = 750;
        }
      });

      const pdfBytes = await pdfDoc.save();

      // Save PDF
      const tmpDir = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      const pdfFilePath = path.join(tmpDir, `${transaction.bookingCode}.pdf`);
      fs.writeFileSync(pdfFilePath, pdfBytes);

      const downloadUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/transaction/download/${transaction.bookingCode}.pdf`;

      const qrCodeOptions = { width: 300, margin: 1 };
      const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl, qrCodeOptions);

      response(
        200,
        "success",
        { qrCode: qrCodeDataUrl, pdfPath: pdfFilePath },
        "PDF generated successfully",
        res
      );
    } catch (error) {
      console.error(
        `Error generating PDF for transaction ${bookingCode}:`,
        error
      );
      next(error);
    }
  }

  static async downloadPDF(req, res, next) {
    try {
      const { bookingCode } = req.params;

      const pdfFilePath = path.join(__dirname, `../tmp/${bookingCode}.pdf`);

      if (!fs.existsSync(pdfFilePath)) {
        return next(new AppError("PDF not found", 404));
      }

      res.download(pdfFilePath, `${bookingCode}.pdf`, (err) => {
        if (err) {
          console.error("Error serving PDF file:", err);
          next(err);
        }
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      next(error);
    }
  }

  static async softDeleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
  
      await prisma.$transaction(async (prisma) => {
        const existingTransaction = await prisma.transaction.findUnique({
          where: { id },
        });
  
        if (!existingTransaction) {
          throw new AppError("Transaction not found", 404);
        }
  
        const deletedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        });
  
        response(
          200,
          "success",
          deletedTransaction,
          "Transaction soft deleted successfully",
          res
        );
      });
    } catch (error) {
      next(error);
    }
  }

  static async restoreTransaction(req, res, next) {
    try {
      const { id } = req.params;
  
      await prisma.$transaction(async (prisma) => {
        // Cari transaksi yang sudah di-soft delete
        const deletedTransaction = await prisma.transaction.findUnique({
          where: {
            id,
            deletedAt: { not: null },
          },
        });
  
        if (!deletedTransaction) {
          throw new AppError("Deleted transaction not found", 404);
        }
  
        // Kembalikan transaksi
        const restoredTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            deletedAt: null,
          },
        });
  
        response(
          200,
          "success",
          restoredTransaction,
          "Transaction restored successfully",
          res
        );
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;
