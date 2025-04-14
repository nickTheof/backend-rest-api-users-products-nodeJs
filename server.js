require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI).then(
  () => {
    logger.info("Mongo DB connection established");
    app.listen(PORT, () => {
      logger.info(`Server is up and running on port ${PORT}...`);
    });
  },
  () => {
    logger.error("Mongo DB Connection failed");
  }
);
