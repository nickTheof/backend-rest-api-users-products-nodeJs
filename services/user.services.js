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

async function isValidUsername(username) {
  const results = await User.countDocuments({ username: username });
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
  const validUsername = await isValidUsername(user.username);
  if (!validEmail || !validUsername) {
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

module.exports = {
  findAll,
  findOneById,
  createOne,
  deleteOneById,
  updateOneById,
};
