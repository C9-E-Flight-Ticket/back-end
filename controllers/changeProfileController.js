const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id; 
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id; 
    const { name, email, phoneNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { name, email, phoneNumber },
    });

    res.status(200).json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
