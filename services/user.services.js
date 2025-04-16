const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

function sanitizeUserForLog(user) {
  const { password, __v, ...safeUser } = user;
  return safeUser;
}

async function isValidEmail(email) {
  const results = await User.countDocuments({ email: email });
  return results === 0;
}

async function findAll() {
  const result = await User.find();
  return result;
}

async function findOneById(id) {
  const results = await User.find({ _id: id });
  if (results.length === 0) {
    throw new ApiError(`User with id ${id} was not found`, 400);
  }
  return results[0];
}

async function createOne(user) {
  const validEmail = await isValidEmail(user.email);
  if (!validEmail) {
    throw new ApiError(`User already exists`, 400);
  }
  const newUser = new User(user);
  const result = await newUser.save();
  logger.info("User created successfully", sanitizeUserForLog(result._doc));
  return result;
}

async function deleteOneById(id) {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(`User with id ${id} was not found`, 400);
  }
  logger.info("User deleted successfully", sanitizeUserForLog(result._doc));
  return result;
}

async function updateOneById(id, updatedUser) {
  const result = await User.findOneAndUpdate(
    { _id: id },
    { $set: updatedUser },
    { runValidators: true, new: true }
  );
  if (!result) {
    throw new ApiError(`User with id ${id} was not found`, 400);
  }
  logger.info("User updated successfully", sanitizeUserForLog(result._doc));
  return result;
}

async function findUserDetailsForJWT(email) {
  const results = await User.findOne(
    { email: email },
    { email: 1, password: 1, roles: 1 }
  );
  if (!results) {
    throw new ApiError(`User with email ${email} was not found`, 400);
  }
  return results;
}

async function createUserFromGoogle(user) {
  const newUser = new User({
    email: user.email,
    firstname: user.given_name,
    lastname: user.family_name,
    googleId: user.sub,
    authProvider: "google",
    avatar: user.picture,
  });
  const result = await newUser.save();
  logger.info(
    "User from google info created successfully",
    sanitizeUserForLog(result._doc)
  );
  return result;
}

module.exports = {
  findAll,
  findOneById,
  createOne,
  deleteOneById,
  updateOneById,
  findUserDetailsForJWT,
  isValidEmail,
  createUserFromGoogle,
};
