const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.get(
  "/me",
  authMiddleware.verifyToken,
  userController.findLoggedInUserDetails
);

router.delete(
  "/deleteMe",
  authMiddleware.verifyToken,
  userController.deleteSoftUser
);

router.patch(
  "/updateMe",
  authMiddleware.verifyToken,
  userController.updateUserDetails
);

//All routes are protected by Authentication and Can be accessed only by admins
router.use(authMiddleware.verifyToken, authMiddleware.verifyRoles("ADMIN"));

router
  .route("/")
  .get(userController.findAllUsers)
  .post(userController.createOne);
router
  .route("/:id")
  .get(userController.findOneUserById)
  .patch(userController.updateOneById)
  .delete(userController.deleteOneById);

module.exports = router;
