const express = require("express");
const userProductsController = require("../controllers/user.products.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.verifyRoles("ADMIN", "EDITOR"),
  userProductsController.findAllProducts
);

module.exports = router;
