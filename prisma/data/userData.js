const bcrypt = require('bcrypt')

const password = 'qwerty123';
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
    name: "user",
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
    createAt: new Date(),
  },
  {
    id: 4, // Pengguna ketiga
    name: "test",
    email: "test@example.com",
    password: hashedPassword,
    phoneNumber: "+6281234567892",
    role: "USER",
    is_verified: true,
    createAt: new Date(),
  },
  
];

module.exports = { userData };