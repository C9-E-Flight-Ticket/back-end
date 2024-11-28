// prisma/transactionData.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const transactionData = [
    {
        userId: 2, // Pastikan user dengan ID ini sudah ada di tabel User
        bookingCode: "BOOK001",
        tax: 10.0,
        totalAmmount: 110.0,
        paymentMethod: "Credit Card",
        status: "Issued", // Status sesuai dengan enum yang telah didefinisikan
    },
    {
        userId: 2, // Pastikan user dengan ID ini sudah ada di tabel User
        bookingCode: "BOOK002",
        tax: 5.0,
        totalAmmount: 55.0,
        paymentMethod: "PayPal",
        status: "Unpaid", // Status sesuai dengan enum yang telah didefinisikan
    },
    {
        userId: 2, // Pastikan user dengan ID ini sudah ada di tabel User
        bookingCode: "BOOK003",
        tax: 0.0,
        totalAmmount: 0.0,
        paymentMethod: "Bank Transfer",
        status: "Cancelled", // Status sesuai dengan enum yang telah didefinisikan
    },
    // Tambahkan lebih banyak data jika diperlukan
];

async function main() {
    for (const transaction of transactionData) {
        await prisma.transaction.create({
            data: transaction,
        });
    }
    console.log("Transaction data seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
