const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../services/user.services");
const secUtil = require("../utils/secUtil");

function generateAccessToken(user) {
  const payload = {
    username: user.username,
    email: user.email,
    roles: user.roles,
  };

  const secret = process.env.JSONWEBTOKEN_SECRET;
  const options = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, secret, options);
}

async function loginUser(username, password) {
  const fetchedUser = await userService.findUserDetailsForJWT(username);
  let isMatch = false;
  if (fetchedUser) {
    isMatch = await secUtil.comparePassword(password, fetchedUser.password);
  }
  if (fetchedUser && fetchedUser.username === username && isMatch) {
    let token = generateAccessToken(fetchedUser);
    return {
      status: true,
      data: token,
    };
  } else {
    return {
      status: false,
      data: "User not logged in",
    };
  }
}

module.exports = { loginUser, generateAccessToken };
