const prisma = require("../models/prismaClients");
const response = require("../utils/response");
const bcrypt = require("bcrypt");

class LoginController {

    // Login user
    static async login(req, res) {
        const { email, password } = req.body;

        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            return response(401, "error", null, "Alamat email tidak terdaftar!", res);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response(401, "error", null, "Maaf, kata sandi salah", res);
        }

        response(200, "success", user, "Berhasil login", res);
    }


}

module.exports = LoginController;
