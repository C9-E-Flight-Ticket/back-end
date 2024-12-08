const notificationData = [
    
    {
      userId: 1,
      title: "Selamat Datang!",
      message: "Terima kasih telah mendaftar di layanan pemesanan tiket kami.",
      read: false,
      createdAt: new Date("2024-04-01T10:00:00Z"),
    },
    {
      userId: 1,
      title: "Pembayaran Berhasil",
      message: "Pembayaran untuk transaksi Anda dengan kode BOOK123 berhasil.",
      read: false,
      createdAt: new Date("2024-04-02T12:00:00Z"),
    },
    {
      userId: 1,
      title: "Penerbangan Dibatalkan",
      message: "Penerbangan GA-401 Anda pada 2024-03-20 dibatalkan. Silakan hubungi kami untuk opsi lainnya.",
      read: false,
      createdAt: new Date("2024-03-20T08:00:00Z"),
    },
  
   
    {
      userId: 2,
      title: "Verifikasi Akun",
      message: "Silakan verifikasi akun Anda dengan mengklik tautan yang telah dikirim ke email Anda.",
      read: false,
      createdAt: new Date("2024-04-01T09:00:00Z"),
    },
    {
      userId: 2,
      title: "Promo Spesial",
      message: "Nikmati diskon 20% untuk penerbangan internasional selama bulan ini!",
      read: false,
      createdAt: new Date("2024-04-05T15:30:00Z"),
    },
  
    
    {
      userId: 3,
      title: "Update Profil",
      message: "Anda dapat memperbarui informasi profil Anda kapan saja di pengaturan akun.",
      read: true,
      createdAt: new Date("2024-03-25T14:00:00Z"),
    },
    {
      userId: 3,
      title: "Tiket Tersedia",
      message: "Tiket untuk penerbangan GA-402 Anda kini tersedia. Segera pesan sebelum habis!",
      read: false,
      createdAt: new Date("2024-04-03T11:45:00Z"),
    },
  ];
  
  module.exports = { notificationData };
  