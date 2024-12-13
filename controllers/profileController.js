const prisma = require("../models/prismaClients");
const response = require("./utils/response"); // Assuming the response utility is imported
const { AppError } = require("../middleware/errorMiddleware");

class ProfileController {

  // Get user profile
  static async getProfile(req, res, next) {
    try {
      const userId = req.params.id;
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
      const userId = req.params.id;
      const { name, email, phoneNumber } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { name, email, phoneNumber },
      });

      response(200, "success", updatedUser, "Profil berhasil diperbarui", res);
    } catch (error) {
      next(error);
    }
  }

  // Delete user profile
  static async deleteProfile(req, res, next) {
    try {
      const userId = req.params.id;

      await prisma.user.delete({
        where: { id: parseInt(userId) },
      });

      response(200, "success", null, "Profil berhasil dihapus", res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
