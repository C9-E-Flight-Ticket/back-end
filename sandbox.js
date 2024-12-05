const randomCode = require("otp-generator");

const bookingCode = randomCode.generate(9, { specialChars: false });

console.log(bookingCode);
