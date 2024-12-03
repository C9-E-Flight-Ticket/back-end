// prisma/transactionData.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const transactionData = [
    {
        userId: 2, 
        bookingCode: "BOOK001",
        tax: 10.0,
        totalAmmount: 110.0,
        paymentMethod: "Credit Card",
        status: "Issued", 
    },
    {
        userId: 2, 
        bookingCode: "BOOK002",
        tax: 5.0,
        totalAmmount: 55.0,
        paymentMethod: "PayPal",
        status: "Unpaid", 
    },
    {
        userId: 2, 
        bookingCode: "BOOK003",
        tax: 0.0,
        totalAmmount: 0.0,
        paymentMethod: "Bank Transfer",
        status: "Cancelled", 
    },
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
