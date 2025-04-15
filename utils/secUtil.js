const bcrypt = require("bcrypt");
require("dotenv").config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

async function generateHashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  generateHashPassword,
  comparePassword,
};
