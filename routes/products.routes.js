const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", productController.findAllProducts);
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.verifyRoles("ADMIN", "EDITOR"),
  productController.createOneProduct
);

router.get("/:id", productController.findOneProductById);

router.use(
  authMiddleware.verifyToken,
  authMiddleware.verifyRoles("ADMIN", "EDITOR")
);
router
  .route("/:id")
  .patch(productController.updateOneById)
  .delete(productController.deleteProductById);

module.exports = router;
