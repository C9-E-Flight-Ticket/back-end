const bcrypt = require('bcrypt')

const password = 'qwerty';
const hashedPassword = bcrypt.hashSync(password, 10);

const userData = [
  {
    name: "Admin Ganteng",
    email: "admin@example.com",
    password: hashedPassword,
    phoneNumber: "+6281234567890",
    role: "ADMIN"
  },
  {
    name: "Pras",
    email: "user@example.com",
    password: hashedPassword,
    phoneNumber: "+6281234567891",
    role: "USER"
  },
  {
    id: 3, // Pengguna ketiga
    name: "User Ketiga",
    email: "user3@example.com",
    password: hashedPassword,
    phoneNumber: "+6281234567892",
    role: "USER",
    is_verified: true,
    createAt: new Date("2024-03-03T08:00:00Z"),
  },
];

module.exports = { userData };