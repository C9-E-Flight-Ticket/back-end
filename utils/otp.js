const otpGenerator = require("otp-generator");
const transporter = require("../libs/nodemailer");
const bcrypt = require("bcrypt");

// In-memory OTP storage
const otps = new Map();

const sendOtp = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });

  const expiry = new Date(Date.now() + 60 * 1000); // 60 seconds
  otps.set(email, { otp, expiry });

  const hashedOtp = await bcrypt.hash(otp, Number(process.env.SALT_ROUNDS));

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 60 seconds.`,
    });

    return hashedOtp;

  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const storedData = otps.get(email);
  if (!storedData) {
    throw new Error("OTP not found or expired");
  }

  const { otp: storedOtp, expiry } = storedData;

  // Check if OTP has expired
  if (Date.now() > expiry.getTime()) {
    otps.delete(email);
    throw new Error("OTP has expired");
  }

  // Verify OTP
  if (otp !== storedOtp) {
    throw new Error("Invalid OTP");
  }

  // Clean up used OTP
  otps.delete(email);
  return true;
};

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otps.entries()) {
    if (now > data.expiry.getTime()) {
      otps.delete(email);
    }
  }
}, 60000);

module.exports = { sendOtp, verifyOtp }; 