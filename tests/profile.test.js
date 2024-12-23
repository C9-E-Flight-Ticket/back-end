const request = require("supertest");
const { app, server } = require("../app");
const prisma = require("../models/prismaClients");

describe("ProfileController", () => {
  let token;
  let userId;
  let originalProfile;
  const originalPassword = "qwerty123";
  const newPassword = "newpassword123";

  beforeAll(async () => {
    // Login dengan pengguna yang sudah ada
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "user3@example.com", password: originalPassword });

    if (response.status === 200 && response.body.payload.status === "success") {
      token = response.body.payload.data; // Ambil token langsung dari data respons
      if (response.headers["set-cookie"]) {
        const cookies = response.headers["set-cookie"];
        const tokenCookie = cookies.find((cookie) =>
          cookie.startsWith("token=")
        )
        if (tokenCookie) {
          token = tokenCookie.split(";")[0].split("=")[1]; // Ambil nilai token dari cookie
        }
      }
      const userResponse = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${token}`);
      userId = userResponse.body.payload.data.id; // Ambil userId dari respons profil
      originalProfile = userResponse.body.payload.data; // Simpan profil asli
    } else {
      console.error("Login response:", response.body);
      throw new Error("Login failed, response structure is not as expected");
    }
  });

  afterAll(async () => {
    // Kembalikan profil ke semula
    await request(app)
      .put("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: originalProfile.name,
        email: originalProfile.email,
        phoneNumber: originalProfile.phoneNumber,
      });

    // Kembalikan password ke semula
    await request(app)
      .post("/api/profile/reset-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: newPassword,
        newPassword: originalPassword,
      });

    await prisma.$disconnect();
    server.close();
  });

  describe("GET /api/profile", () => {
    it("should get user profile", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("id", userId);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/profile");

      expect(response.status).toBe(401);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Authentication required");
    });
  });

  describe("PUT /api/profile", () => {
    it("should update user profile", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Name",
          email: "updated@example.com",
          phoneNumber: "1234567890",
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.data).toHaveProperty("name", "Updated Name");
      expect(response.body.payload.data).toHaveProperty("email", "updated@example.com");
      expect(response.body.payload.data).toHaveProperty("phoneNumber", "1234567890");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .put("/api/profile")
        .send({
          name: "Updated Name",
          email: "updated@example.com",
          phoneNumber: "1234567890",
        });

      expect(response.status).toBe(401);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Authentication required");
    });
  });

  describe("POST /api/profile/reset-password", () => {
    it("should change user password", async () => {
      const response = await request(app)
        .post("/api/profile/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: originalPassword,
          newPassword: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.payload.status).toBe("success");
      expect(response.body.payload.message).toBe("Password berhasil diubah");
    });

    it("should return 400 if old password is incorrect", async () => {
      const response = await request(app)
        .post("/api/profile/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: "wrongpassword",
          newPassword: newPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Old password is incorrect");
    });

    it("should return 400 if input is invalid", async () => {
      const response = await request(app)
        .post("/api/profile/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: "",
          newPassword: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Old password and new password are required");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .post("/api/profile/reset-password")
        .send({
          oldPassword: originalPassword,
          newPassword: newPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.payload.status).toBe("error");
      expect(response.body.payload.message).toBe("Authentication required");
    });
  });
});