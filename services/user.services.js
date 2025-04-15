const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

exports.findAll = async () => {
  const result = await User.find();
  return result;
};

exports.findOneById = async (id) => {
  const results = await User.find({ _id: id });
  if (results.length === 0) {
    throw new ApiError(`User with id ${id} was not found`, 400);
  }
  return results;
};

async function isValidEmail(email) {
  const results = await User.find({ email: email });
  return results.length === 0;
}

async function isValidUsername(username) {
  const results = await User.find({ username: username });
  return results.length === 0;
}

exports.createOne = async (user) => {
  const validEmail = await isValidEmail(user.email);
  const validUsername = await isValidUsername(user.username);
  if (!validEmail || !validUsername) {
    throw new ApiError(`User already exists`, 400);
  }
  const newUser = new User(user);
  const result = await newUser.save();
  logger.info("User created successfully", result);
  return result;
};
