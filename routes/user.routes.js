const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();

router
  .route("/")
  .get(userController.findAllUsers)
  .post(userController.createOne);
router.route("/:id").get(userController.findOneUserById);

module.exports = router;
