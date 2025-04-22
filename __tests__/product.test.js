const mongoose = require("mongoose");
const request = require("supertest");
const authService = require("../services/auth.services");
const userService = require("../services/user.services");
const productService = require("../services/product.services");
const app = require("../app");
const secUtil = require("../utils/secUtil");

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
  });
  editor = await userService.createOne({
    email: "editortest@mail.com",
    password: hashedPassword,
    roles: ["EDITOR"],
  });
  reader = await userService.createOne({
    email: "readertest@mail.com",
    password: hashedPassword,
    roles: ["READER"],
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

describe("GET /api/v1/products", () => {
  it("GET /api/v1/products Successful get the list of all products", async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("POST /api/v1/products", () => {
  it("POST /api/v1/products Successful Admin creates a product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        product: "Test Admin Product",
        cost: 50,
        quantity: 10,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Admin Product");
    expect(res.body.data.cost).toBe(50);
    expect(res.body.data.quantity).toBe(10);
  });

  it("POST /api/v1/products Successful Editor creates a product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        product: "Test Editor Product",
        cost: 50,
        quantity: 10,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Editor Product");
    expect(res.body.data.cost).toBe(50);
    expect(res.body.data.quantity).toBe(10);
  });

  it("POST /api/v1/products Fails Reader unauthorized to create a product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        product: "Test Reader Product",
        cost: 50,
        quantity: 10,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("POST /api/v1/products Fails Admin to create an already existent product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        product: "Test Admin Product",
        cost: 50,
        quantity: 10,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(
      `Product with name Test Admin Product already exists`
    );
  });

  it("POST /api/v1/products Fails Admin to create a product with empty body", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input data");
  });

  it("POST /api/v1/products Fails Admin to create a product with negative price and quantity", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        product: "TEST",
        price: -50,
        quantity: -50,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input data");
  });

  it("POST /api/v1/products Lack of token unauthorized to create the resource", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .send({
        product: "TEST",
        price: 50,
        quantity: 50,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("POST /api/v1/products Fail Invalid Token unauthorized to create the resource", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer invalidToken`)
      .send({
        product: "TEST",
        price: 50,
        quantity: 50,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("POST /api/v1/products Fail Invalid Token unauthorized to create the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${jwtExpired}`)
      .send({
        product: "TEST",
        price: 50,
        quantity: 50,
        category: ["electronics"],
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  }, 10000);
});

describe("GET /api/v1/products/{id}", () => {
  beforeAll(async () => {
    productCreated = await productService.findOneByName("Test Admin Product");
  });
  it("GET /api/v1/products/{id} Successful get the details of the product with id", async () => {
    const res = await request(app).get(
      `/api/v1/products/${productCreated._id}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Admin Product");
  });

  it("GET /api/v1/products/{id} Fails get the details of the product. Non existent product", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(`Product with id ${fakeId} was not found`);
  });

  it("GET /api/v1/products/{id} Fails get the details of the product due to invalid id format", async () => {
    const res = await request(app).get(`/api/v1/products/invalidId`);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });
});

describe("PATCH /api/v1/products/{id}", () => {
  beforeAll(async () => {
    productAdminCreated = await productService.findOneByName(
      "Test Admin Product"
    );
    productEditorCreated = await productService.findOneByName(
      "Test Editor Product"
    );
  });

  it("PATCH /api/v1/products/{id} Successful Admin modify existent product", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Admin Product");
    expect(res.body.data.cost).toBe(150);
  }, 10000);

  it("PATCH /api/v1/products/{id} Successful Editor modify existent product", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productEditorCreated._id}`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Editor Product");
    expect(res.body.data.cost).toBe(150);
  }, 10000);

  it("PATCH /api/v1/products/{id} Fails Admin modify existent product due to product already exists", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        product: "Test Editor Product",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("already exists");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fails Admin modify existent product due to negative price or quantity", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        cost: -50,
        price: -50,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid input data");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fails Editor modify existent product due to product already exists", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productEditorCreated._id}`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        product: "Test Admin Product",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("already exists");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fail Admin Cannot modify UserId Invalid", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/invalidId`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fail Admin Cannot modify Product not exists", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/v1/products/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain(`was not found`);
  }, 10000);

  it("PATCH /api/v1/products/{id} Lack of token unauthorized to modify the resource", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fail Invalid Token unauthorized to modify the resource", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer invalidToken`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fail Token expired unauthorized to modify the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer ${jwtExpired}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  }, 10000);

  it("PATCH /api/v1/products/{id} Fail Reader unauthorized to modify the resource", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        cost: 150,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});

describe("DELETE /api/v1/products/{id}", () => {
  beforeAll(async () => {
    productAdminCreated = await productService.findOneByName(
      "Test Admin Product"
    );
    productEditorCreated = await productService.findOneByName(
      "Test Editor Product"
    );
  });

  it("DELETE /api/v1/products/{id} Successful Admin delete existent product", async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productAdminCreated._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Admin Product");
  }, 10000);

  it("DELETE /api/v1/products/{id} Successful Editor delete existent product", async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productEditorCreated._id}`)
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.product).toBe("Test Editor Product");
  }, 10000);

  it("DELETE /api/v1/products/{id} Fail Admin Cannot delete productId Invalid", async () => {
    const res = await request(app)
      .delete(`/api/v1/products/invalidId`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  }, 10000);

  it("DELETE /api/v1/products/{id} Fail Admin Cannot delete Product not exists", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/v1/products/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe(`Product with id ${fakeId} was not found`);
  }, 10000);

  it("DELETE /api/v1/products/{id} Lack of token unauthorized to delete the resource", async () => {
    const res = await request(app).delete(
      `/api/v1/products/${productEditorCreated._id}`
    );
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Access denied. No token provided");
  }, 10000);

  it("DELETE /api/v1/products/{id} Fail Invalid Token unauthorized to delete the resource", async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productEditorCreated._id}`)
      .set("Authorization", `Bearer invalidToken`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt malformed");
  }, 10000);

  it("DELETE /api/v1/products/{id} Fail Token expired unauthorized to delete the resource", async () => {
    const jwtExpired =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxMTAwYTBiYTljZjdlMjY1YTcyYTEiLCJlbWFpbCI6ImFkbWludGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0NTMzNDg3MSwiZXhwIjoxNzQ1MzM4NDcxfQ.WKhyBgM0arGMFg5gethbQOCb535hfi4KG88vCxJackw";
    const res = await request(app)
      .delete(`/api/v1/products/${productEditorCreated._id}`)
      .set("Authorization", `Bearer ${jwtExpired}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("jwt expired");
  }, 10000);

  it("DELETE /api/v1/products/{id} Fail Reader unauthorized to delete the resource", async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productEditorCreated._id}`)
      .set("Authorization", `Bearer ${readerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toBe("Forbidden: insufficient permissions");
  }, 10000);
});
