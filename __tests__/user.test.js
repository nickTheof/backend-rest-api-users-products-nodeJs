const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const authService = require("../services/auth.services");
const userService = require("../services/user.services");
require("dotenv").config();

// Connecting to Mongo DB before starting all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI).then(
    () => {
      console.log("Connection to MongoDB established for Jest");
    },
    (err) => {
      console.log("Failed to connect to MongoDB for Jest", err);
    }
  );
  const admin = {
    _id: "6801100a0ba9cf7e265a72a1",
    email: "admintest@mail.com",
    roles: ["ADMIN"],
  };
  const editor = {
    _id: "6801100a0ba9cf7e265a72a1",
    email: "editortest@mail.com",
    roles: ["EDITOR"],
  };
  const reader = {
    _id: "6801100a0ba9cf7e265a72a1",
    email: "readertest@mail.com",
    roles: ["READER"],
  };
  adminToken = authService.generateAccessToken(admin);
  editorToken = authService.generateAccessToken(editor);
  readerToken = authService.generateAccessToken(reader);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/v1/users", () => {
  it("GET /api/v1/users ADMIN succesful get all users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  }, 10000);

  it("GET /api/v1/users Fail due to lack of token", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("GET /api/v1/users Fail due to invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer invalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("GET /api/v1/users Fail Reader unauthorized to access the resource", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);

  it("GET /api/v1/users Fail Editor unauthorized to access the resource", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});

describe("POST /api/v1/users", () => {
  it("POST /api/v1/users ADMIN Successful creates the resource", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstname: "testname",
        lastname: "testlastname",
        email: "testingmail@mail.com",
        password: "12345",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.firstname).toBe("testname");
    expect(res.body.data.lastname).toBe("testlastname");
    expect(res.body.data.email).toBe("testingmail@mail.com");
  }, 10000);

  it("POST /api/v1/users ADMIN Fails to creates the resource. User already exists. ", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstname: "testname",
        lastname: "testlastname",
        email: "testingmail@mail.com",
        password: "12345",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("User already exists");
  }, 10000);

  it("POST /api/v1/users ADMIN Fails to creates the resource due to empty body", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  }, 10000);

  it("POST /api/v1/users Lack of token unauthorized to create the resource", async () => {
    const res = await request(app).post("/api/v1/users").send({
      firstname: "testname",
      lastname: "testlastname",
      email: "testingmail@mail.com",
      password: "12345",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("POST /api/v1/users Invalid Token unauthorized to create the resource", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer invalidToken}`)
      .send({
        firstname: "testname",
        lastname: "testlastname",
        email: "testingmail@mail.com",
        password: "12345",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("POST /api/v1/users Fail Reader unauthorized to create the resource", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        firstname: "testname",
        lastname: "testlastname",
        email: "testingmail@mail.com",
        password: "12345",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);

  it("POST /api/v1/users Fail Editor unauthorized to create the resource", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        firstname: "testname",
        lastname: "testlastname",
        email: "testingmail@mail.com",
        password: "12345",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});

describe("GET /api/v1/users/{id}", () => {
  beforeAll(async () => {
    userCreated = await userService.findOneByEmail("testingmail@mail.com");
    userId = userCreated._id;
  });

  it("GET /api/v1/users/{id} Successful Get Admin authorized to access the resource", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("testingmail@mail.com");
  }, 10000);

  it("GET /api/v1/users/{id} Fail Get Admin UserId Invalid", async () => {
    const res = await request(app)
      .get(`/api/v1/users/invalidId`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  }, 10000);

  it("GET /api/v1/users/{id} Fail Get Admin User not exists", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(`User with id ${fakeId} was not found`);
  }, 10000);

  it("GET /api/v1/users/{id} Lack of token unauthorized to access the resource", async () => {
    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("GET /api/v1/users/{id} Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer invalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("GET /api/v1/users/{id} Fail Reader unauthorized to access the resource", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);

  it("GET /api/v1/users/{id} Fail Editor unauthorized to access the resource", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});

describe("PATCH /api/v1/users/{id}", () => {
  beforeAll(async () => {
    userCreated = await userService.findOneByEmail("testingmail@mail.com");
    userId = userCreated._id;
  });

  it("PATCH /api/v1/users/{id} Successful Admin modify existent user", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isActive: false,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("testingmail@mail.com");
    expect(res.body.data.isActive).toBeFalsy();
  }, 10000);

  it("PATCH /api/v1/users/{id} Fail Admin Cannot modify UserId Invalid", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/invalidId`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isActive: false,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  }, 10000);

  it("PATCH /api/v1/users/{id} Fail Admin Cannot modify User not exists", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/v1/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isActive: false,
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(`User with id ${fakeId} was not found`);
  }, 10000);

  it("PATCH /api/v1/users/{id} Lack of token unauthorized to modify the resource", async () => {
    const res = await request(app).patch(`/api/v1/users/${userId}`).send({
      isActive: false,
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("PATCH /api/v1/users/{id} Fail Invalid Token unauthorized to modify the resource", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer invalidToken`)
      .send({
        isActive: false,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("PATCH /api/v1/users/{id} Fail Reader unauthorized to modify the resource", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        isActive: false,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);

  it("PATCH /api/v1/users/{id} Fail Editor unauthorized to modify the resource", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        isActive: false,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});

describe("DELETE /api/v1/users/{id}", () => {
  beforeAll(async () => {
    userCreated = await userService.findOneByEmail("testingmail@mail.com");
    userId = userCreated._id;
  });

  it("DELETE /api/v1/users/{id} Successful Admin delete existent user", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("testingmail@mail.com");
  }, 10000);

  it("DELETE /api/v1/users/{id} Fail Admin Cannot delete UserId Invalid", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/invalidId`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  }, 10000);

  it("DELETE /api/v1/users/{id} Fail Admin Cannot delete User not exists", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/v1/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(`User with id ${fakeId} was not found`);
  }, 10000);

  it("DELETE /api/v1/users/{id} Lack of token unauthorized to delete the resource", async () => {
    const res = await request(app).delete(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("DELETE /api/v1/users/{id} Fail Invalid Token unauthorized to delete the resource", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer invalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("DELETE /api/v1/users/{id} Fail Reader unauthorized to delete the resource", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);

  it("DELETE /api/v1/users/{id} Fail Editor unauthorized to delete the resource", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});

describe("GET /api/v1/users/me", () => {
  it("GET /api/v1/users/me Successful get current authenticated user details", async () => {
    const res = await request(app)
      .get(`/api/v1/users/me`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("admintest@mail.com");
    expect(res.body.data._id).toBe("6801100a0ba9cf7e265a72a1");
  }, 10000);

  it("GET /api/v1/users/me Lack of token unauthorized to access the current authenticated user", async () => {
    const res = await request(app).get(`/api/v1/users/me`);
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("GET /api/v1/users/me Fail Invalid Token unauthorized to access the current authenticated user", async () => {
    const res = await request(app)
      .get(`/api/v1/users/me`)
      .set("Authorization", `Bearer invalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);
});

describe("PATCH /api/v1/users/me", () => {
  it("PATCH /api/v1/users/me Successful current authenticated user update specific fields", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstname: "Nikolas",
        lastname: "Theofanis",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data._id).toBe("6801100a0ba9cf7e265a72a1");
    expect(res.body.data.email).toBe("admintest@mail.com");
    expect(res.body.data.firstname).toBe("Nikolas");
    expect(res.body.data.lastname).toBe("Theofanis");
  }, 10000);

  it("PATCH /api/v1/users/{id} Lack of token unauthorized to update the current authenticated user", async () => {
    const res = await request(app).patch(`/api/v1/users/me`).send({
      firstname: "admin",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("PATCH /api/v1/users/{id} Fail Invalid Token unauthorized to update the current authenticated user", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me`)
      .set("Authorization", `Bearer invalidToken`)
      .send({
        firstname: "admin",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);
});

describe("DELETE /api/v1/users/me", () => {
  afterAll(async () => {
    await request(app)
      .patch(`/api/v1/users/6801100a0ba9cf7e265a72a1`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isActive: true,
      });
  });

  it("DELETE /api/v1/users/me Successful soft delete of current authenticated user", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/me`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.isActive).toBeFalsy();
  }, 10000);

  it("DELETE /api/v1/users/me Lack of token unauthorized to soft delete the current authenticated user", async () => {
    const res = await request(app).delete(`/api/v1/users/me`);
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("DELETE /api/v1/users/me Fail Invalid Token unauthorized to soft delete the current authenticated user", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/me`)
      .set("Authorization", `Bearer invalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);
});

describe("PATCH /api/v1/users/me/change-password", () => {
  it("PATCH /api/v1/users/me/change-password Successfully changes password with valid currentPassword and matching newPassword/confirmPassword", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "12345",
        newPassword: "12345!",
        newPasswordConfirm: "12345!",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("admintest@mail.com");
    // Reset state
    await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "12345!",
        newPassword: "12345",
        newPasswordConfirm: "12345",
      });
  }, 10000);

  it("PATCH /api/v1/users/me/change-password Fails with incorrect currentPassword", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "WrongPass!",
        newPassword: "NewPass",
        newPasswordConfirm: "NewPass",
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Unauthorized! Wrong current password");
  }, 10000);

  it("PATCH /api/v1/users/me/change-password Fails when newPassword and confirmPassword do not match", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "12345",
        newPassword: "NewPass123!",
        newPasswordConfirm: "Mismatch123!",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(
      "New password and new password confirm must be the same"
    );
  }, 10000);

  it("PATCH /api/v1/users/me/change-password Fails when the request body doesnt contains all the info", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(
      "You should provide current password, new password and new password confirm"
    );
  }, 10000);

  it("PATCH /api/v1/users/me/change-password Fails when no token is provided", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .send({
        currentPassword: "12345",
        newPassword: "NewPass123!",
        newPasswordConfirm: "NewPass123!",
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("PATCH /api/v1/users/me/change-password Fails when invalid token is provided", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/change-password`)
      .set("Authorization", `Bearer invalidToken`)
      .send({
        currentPassword: "12345",
        newPassword: "NewPass123!",
        newPasswordConfirm: "NewPass123!",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("PATCH /api/v1/users/me/change-password Should fail if user logged in with Google", async () => {
    const googleUserToken = authService.generateAccessToken({
      _id: "6807565b035bf547ba9cd373",
      email: "googletest@mail.com",
      roles: ["READER"],
    });
    const res = await request(app)
      .patch("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${googleUserToken}`)
      .send({
        currentPassword: "Password",
        newPassword: "NewPass123!",
        newPasswordConfirm: "NewPass123!",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "You use a google account for login. You cannot change your password from this route"
    );
  });
});
