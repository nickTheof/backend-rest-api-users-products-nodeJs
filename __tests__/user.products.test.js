const mongoose = require("mongoose");
const request = require("supertest");
const userService = require("../services/user.services");
const authService = require("../services/auth.services");
const secUtil = require("../utils/secUtil");

const app = require("../app");

// Connecting to Mongo DB before starting all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST).then(
    () => {
      console.log("Connection to MongoDB established for Jest");
    },
    (err) => {
      console.log("Failed to connect to MongoDB for Jest", err);
    }
  );

  const hashedPassword = await secUtil.generateHashPassword("12345");

  admin = await userService.createOne({
    email: "admintest@mail.com",
    password: hashedPassword,
    roles: ["ADMIN"],
    products: [
      {
        product: "Product 1",
        cost: 10,
        quantity: 2,
      },
      {
        product: "Product 2",
        cost: 20,
        quantity: 3,
      },
      {
        product: "Product 3",
        cost: 30,
        quantity: 3,
      },
    ],
  });
  editor = await userService.createOne({
    email: "editortest@mail.com",
    password: hashedPassword,
    roles: ["EDITOR"],
    products: [
      {
        product: "Product 1",
        cost: 10,
        quantity: 2,
      },
      {
        product: "Product 2",
        cost: 20,
        quantity: 3,
      },
      {
        product: "Product 3",
        cost: 30,
        quantity: 3,
      },
    ],
  });
  reader = await userService.createOne({
    email: "readertest@mail.com",
    password: hashedPassword,
    roles: ["READER"],
    products: [
      {
        product: "Product 1",
        cost: 10,
        quantity: 2,
      },
      {
        product: "Product 2",
        cost: 20,
        quantity: 3,
      },
      {
        product: "Product 3",
        cost: 30,
        quantity: 3,
      },
    ],
  });

  adminToken = authService.generateAccessToken({
    _id: admin._id,
    email: admin.email,
    roles: admin.roles,
  });
  editorToken = authService.generateAccessToken({
    _id: editor._id,
    email: editor.email,
    roles: editor.roles,
  });
  readerToken = authService.generateAccessToken({
    _id: reader._id,
    email: reader.email,
    roles: reader.roles,
  });
});

afterAll(async () => {
  await userService.deleteOneById(admin._id);
  await userService.deleteOneById(editor._id);
  await userService.deleteOneById(reader._id);
  await mongoose.connection.close();
});

describe("GET /api/v1/user-products", () => {
  it("GET Admin successful get a list with all products", async () => {
    const res = await request(app)
      .get("/api/v1/user-products")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET Editor successful get a list with all products", async () => {
    const res = await request(app)
      .get("/api/v1/user-products")
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET Reader unauthorized to get a list with all products", async () => {
    const res = await request(app)
      .get("/api/v1/user-products")
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("GET Lack of token unauthorized to access the resource", async () => {
    const res = await request(app).get("/api/v1/user-products");
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("GET Fails Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .get("/api/v1/user-products")
      .set("Authorization", `Bearer InvalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  });

  it("GET Fails Token expired unauthorized to access the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .get("/api/v1/user-products")
      .set("Authorization", `Bearer ${jwtExpired}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  });
});

describe("GET /api/v1/user-products/{userId}", () => {
  it("GET Admin successful get a list with all products of the specific user", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  it("GET Editor successful get a list with all products of the specific user", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  it("GET Reader unauthorized to get a list with all products of a specific user", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/${editor._id}`)
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("GET Fails get the details products of the user. Non existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/user-products/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain(`was not found`);
  });

  it("GET Fails get the details products of the user due to invalid id format", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/invalidId`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("GET Lack of token unauthorized to access the resource", async () => {
    const res = await request(app).get(`/api/v1/user-products/${editor._id}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("GET Fails Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/${editor._id}`)
      .set("Authorization", `Bearer InvalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  });

  it("GET Fails Token expired unauthorized to access the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .get(`/api/v1/user-products/${editor._id}`)
      .set("Authorization", `Bearer ${jwtExpired}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  });
});

describe("GET /api/v1/user-products/me", () => {
  it("GET current authenticated user successful gets a list with all products", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBeTruthy();
  });

  it("GET Lack of token unauthorized to access the resource", async () => {
    const res = await request(app).get(`/api/v1/user-products/me`);
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("GET Fails Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .get(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer InvalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  });

  it("GET Fails Token expired unauthorized to access the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .get(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${jwtExpired}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  });
});

describe("GET /api/v1/user-products/stats/user-purchasing-stats", () => {
  it("GET Admin successful the statistics purchasing details", async () => {
    const res = await request(app)
      .get("/api/v1/user-products/stats/user-purchasing-stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  it("GET Editor unauthorized to access the statistics purchasing details", async () => {
    const res = await request(app)
      .get("/api/v1/user-products/stats/user-purchasing-stats")
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("GET Reader unauthorized to access the statistics purchasing details", async () => {
    const res = await request(app)
      .get("/api/v1/user-products/stats/user-purchasing-stats")
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("GET Lack of token unauthorized to access the resource", async () => {
    const res = await request(app).get(
      "/api/v1/user-products/stats/user-purchasing-stats"
    );
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("GET Fails Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .get("/api/v1/user-products/stats/user-purchasing-stats")
      .set("Authorization", `Bearer InvalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  });

  it("GET Fails Token expired unauthorized to access the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .get("/api/v1/user-products/stats/user-purchasing-stats")
      .set("Authorization", `Bearer ${jwtExpired}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  });
});

describe("POST /api/v1/user-products/me", () => {
  it("POST current authenticated user successful insert a new product", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBeTruthy();
  });

  it("POST current authenticated user successful insert multiple products", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
          {
            product: "Product 2",
            cost: 40,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBeTruthy();
  });

  it("POST current authenticated fails to insert product due to invalid quantity and price", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: -45,
            quantity: -10,
          },
        ],
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input");
  });

  it("POST Lack of token unauthorized to access the resource", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("POST Fails Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer InvalidToken`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  });

  it("POST Fails Token expired unauthorized to access the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${jwtExpired}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  });
});

describe("POST /api/v1/user-products/{userId}", () => {
  it("POST Admin successful insert a new product to a specific user", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBeTruthy();
  });

  it("POST ADMIN successful insert multiple products to a specific user", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
          {
            product: "Product 2",
            cost: 40,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBeTruthy();
  });

  it("POST Editor unauthorized to insert multiple products to a specific user", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
          {
            product: "Product 2",
            cost: 40,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("POST reader unauthorized to insert multiple products to a specific user", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
          {
            product: "Product 2",
            cost: 40,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("POST ADMIN fails to insert product due to invalid quantity and price", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/${reader._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: -45,
            quantity: -10,
          },
        ],
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input");
  });

  it("POST Lack of token unauthorized to access the resource", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("POST Fails Invalid Token unauthorized to access the resource", async () => {
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer InvalidToken`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  });

  it("POST Fails Token expired unauthorized to access the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .post(`/api/v1/user-products/me`)
      .set("Authorization", `Bearer ${jwtExpired}`)
      .send({
        products: [
          {
            product: "Product 1",
            cost: 45,
            quantity: 10,
          },
        ],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  });
});
