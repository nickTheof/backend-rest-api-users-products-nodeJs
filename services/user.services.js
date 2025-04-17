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
  const user = await User.findById(id);
  if (!user) throw new ApiError(`User with id ${id} was not found`, 404);
  return user;
}

async function findOneByEmail(email) {
  const user = await User.findOne({ email: email });
  if (!user) throw new ApiError(`User with email ${email} was not found`, 404);
  return user;
}

async function createOne(user) {
  if (!(await isValidEmail(user.email)))
    throw new ApiError(`User already exists`, 400);
  const newUser = new User(user);
  const result = await newUser.save();
  logger.info("User created successfully", sanitizeUserForLog(result._doc));
  return result;
}

async function deleteOneById(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(`User with id ${id} was not found`, 404);
  logger.info("User deleted", sanitizeUser(user));
  return user;
}

async function updateOneById(id, updateData) {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(`User with id ${id} was not found`, 404);
  logger.info("User updated", sanitizeUser(user));
  return user;
}

async function findUserDetailsForJWT(email) {
  const user = await User.findOne(
    { email: email },
    { _id: 1, email: 1, password: 1, roles: 1 }
  );
  if (!user) {
    throw new ApiError(`User with email ${email} was not found`, 404);
  }
  return user;
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

async function updateDetailsUser(user, updatedDetails) {
  if (
    updatedDetails.email &&
    user.email !== updatedDetails.email &&
    !(await isValidEmail(updatedDetails.email))
  ) {
    throw new ApiError("Invalid email input", 400);
  }
  const updatedUser = await User.findByIdAndUpdate(user._id, updatedDetails, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
}

module.exports = {
  findAll,
  findOneById,
  findOneByEmail,
  createOne,
  deleteOneById,
  updateOneById,
  findUserDetailsForJWT,
  isValidEmail,
  createUserFromGoogle,
  updateDetailsUser,
};
