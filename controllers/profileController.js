const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const { AppError } = require("../middleware/errorMiddleware");
const bcrypt = require("bcrypt");

class ProfileController {
  // Get user profile
  static async getProfile(req, res, next) {
    try {
      const userId = req.user?.id;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      response(200, "success", user, "Berhasil menampilkan profil user", res);
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const { name, email, phoneNumber } = req.body;
      const userId = req.user?.id;
      
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { name, email, phoneNumber },
      });

      response(200, "success", updatedUser, "Profil berhasil diperbarui", res);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!oldPassword || !newPassword) {
        return next(new AppError("Old password and new password are required", 400));
      }

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        return next(new AppError("Old password is incorrect", 400));
      }

      const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS));

      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { password: hashedPassword },
      });

      response(200, "success", null, "Password berhasil diubah", res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
