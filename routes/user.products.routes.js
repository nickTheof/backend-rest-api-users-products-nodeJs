const express = require("express");
const userProductsController = require("../controllers/user.products.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware.verifyToken);

router
  .route("/me")
  .get(userProductsController.findAllMyProducts)
  .post(userProductsController.createProducts)
  .patch(userProductsController.updateMyQuantityOfProduct);

router.get(
  "/stats/user-purchasing-stats",
  authMiddleware.verifyRoles("ADMIN"),
  userProductsController.getUsersPurchasingStats
);

router.get(
  "/",
  authMiddleware.verifyRoles("ADMIN", "EDITOR"),
  userProductsController.findAllProducts
);

router
  .route("/:userId")
  .get(
    authMiddleware.verifyRoles("ADMIN", "EDITOR"),
    userProductsController.findAllProductsByUserId
  )
  .post(
    authMiddleware.verifyRoles("ADMIN"),
    userProductsController.createProductsById
  );

router
  .route("/:userId/products/:productId")
  .patch(
    authMiddleware.verifyRoles("ADMIN"),
    userProductsController.updateProductQuantity
  )
  .delete(
    authMiddleware.verifyRoles("ADMIN"),
    userProductsController.deleteProduct
  );

module.exports = router;
