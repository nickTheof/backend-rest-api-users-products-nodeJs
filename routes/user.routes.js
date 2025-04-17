const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

//All below routes are protected by Authentication
router.use(authMiddleware.verifyToken);

router.get("/me", userController.findLoggedInUserDetails);
router.delete("/deleteMe", userController.deleteSoftUser);
router.patch("/updateMe", userController.updateUserDetails);
router.patch("/updateMyPassword", userController.updatePassword);

//All below routes are protected by Authentication and Can be accessed only by admins
router.use(authMiddleware.verifyRoles("ADMIN"));

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
