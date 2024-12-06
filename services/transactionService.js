const prisma = require("../models/prismaClients");

async function checkExpiredTransactions() {
  const now = new Date();

  // Temukan semua transaksi yang telah kedaluwarsa dan masih memiliki status "Unpaid"
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      expiredAt: {
        lt: now,
      },
      status: 'Unpaid',
    },
  });

  // Perbarui status setiap transaksi yang kedaluwarsa menjadi "Cancelled"
  await Promise.all(expiredTransactions.map(async (transaction) => {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'Cancelled' },
    });

    await prisma.seat.updateMany({
      where: { id: { in: transaction.seats } },
      data: { available: true },
    });
  }));

  console.log(`Checked for expired transactions. Updated ${expiredTransactions.length} transactions to "Cancelled".`);
}

module.exports = {
  checkExpiredTransactions,
};