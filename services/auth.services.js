const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../services/user.services");
const secUtil = require("../utils/secUtil");
const { OAuth2Client } = require("google-auth-library");

function generateAccessToken(user) {
  const payload = {
    email: user.email,
    roles: user.roles,
  };

  const secret = process.env.JSONWEBTOKEN_SECRET;
  const options = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, secret, options);
}

function verifyAccessToken(token) {
  const secret = process.env.JSONWEBTOKEN_SECRET;
  try {
    const payload = jwt.verify(token, secret);
    return {
      verified: true,
      data: payload,
    };
  } catch (err) {
    return {
      verified: false,
      data: err.message,
    };
  }
}

async function loginUser(email, password) {
  const fetchedUser = await userService.findUserDetailsForJWT(email);
  let isMatch = false;
  if (fetchedUser) {
    isMatch = await secUtil.comparePassword(password, fetchedUser.password);
  }
  if (fetchedUser && fetchedUser.email === email && isMatch) {
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

async function googleAuth(code) {
  console.log("Google Login");
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  try {
    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const userInfo = await ticket.getPayload();
    return {
      status: true,
      user: userInfo,
      tokens,
    };
  } catch (err) {
    return { status: false, error: "Failed to authenticate with google" };
  }
}

module.exports = {
  loginUser,
  generateAccessToken,
  verifyAccessToken,
  googleAuth,
};
