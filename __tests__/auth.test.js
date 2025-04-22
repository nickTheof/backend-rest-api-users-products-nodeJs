const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const authService = require("../services/auth.services");
const userService = require("../services/user.services");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI).then(
    () => {
      console.log("Connection to MongoDB established for Jest");
    },
    (err) => {
      console.log("Failed to connect to MongoDB for Jest", err);
    }
  );
});

afterAll(async () => {
  const user = await userService.findOneByEmail("testuser@mail.com");
  await userService.deleteOneById(user._id);
  await mongoose.connection.close();
});

describe("POST /api/v1/auth/register", () => {
  it("POST /api/v1/auth/register Successful register of a local user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testuser@mail.com",
      password: "12345",
      confirmPassword: "12345",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("testuser@mail.com");
    expect(res.body.data.authProvider).toBe("local");
  });

  it("POST /api/v1/auth/register Fails registration of a local user. User already exists", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testuser@mail.com",
      password: "12345",
      confirmPassword: "12345",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("already exists");
  });

  it("POST /api/v1/auth/register Fails registration of a local user. Empty body request", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input");
  });

  it("POST /api/v1/auth/register Fails registration of a local user. Empty body request", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input");
  });

  it("POST /api/v1/auth/register Fails registration of a local user. Password and Password confirmation are not the same", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testuser2@mail.com",
      password: "12345",
      confirmPassword: "123456",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input");
  });
});

describe("POST /api/v1/auth/login", () => {
  it("POST /api/v1/auth/login Successful login of a local registered user", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@mail.com",
      password: "12345",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  });

  it("POST /api/v1/auth/login Fails login of a local registered user due to empty body", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("login credentials");
  });

  it("POST /api/v1/auth/login Fails login of a local registered user due to user not exists", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "fakemail@mail.com",
      password: "12345",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("login credentials");
  });

  it("POST /api/v1/auth/login Fails login of a local registered user due to wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@mail.com",
      password: "12345678",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("not logged in");
  });

  it("POST /api/v1/auth/login Fails login of a local registered user due to inactivity of user. User is soft deleted", async () => {
    const user = await userService.findUserDetailsForJWT("testuser@mail.com");
    const userToken = authService.generateAccessToken(user);
    await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", `Bearer ${userToken}`);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@mail.com",
      password: "12345678",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("not logged in");
  });

  it("POST /api/v1/auth/login Fails login of a google registered user via this route", async () => {
    const user = await userService.findOneByEmail("testuser@mail.com");
    await userService.updateOneById(user._id, {
      is_active: true,
      password: "fakepassword",
      authProvider: "google",
    });
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@mail.com",
      password: "12345",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("not logged in");
  });
});

describe("GET /api/v1/auth/google/callback", () => {
  it("GET /api/v1/auth/google/callback fails when no authorization code is provided", async () => {
    const res = await request(app).get("/api/v1/auth/google/callback");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Authorization code is missing");
  });

  it("GET /api/v1/auth/google/callback fails when no authorization code is provided", async () => {
    const res = await request(app).get(
      "/api/v1/auth/google/callback?code=fakeCode"
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Problem in Google Login");
  });
});
