const express = require("express");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", userController.signupLocalUser);
router.get("/google/callback", authController.googleLogin);

module.exports = router;
