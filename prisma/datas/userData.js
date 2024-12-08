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
  }
];

module.exports = { userData };