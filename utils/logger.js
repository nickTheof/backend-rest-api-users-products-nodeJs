require("winston-daily-rotate-file");
require("winston-mongodb");
const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    winston.format.json()
  ),
});

const mongodbDevLogsTransport = new winston.transports.MongoDB({
  level: "info",
  db: process.env.MONGODB_URI,
  collection: "dev_server_logs",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "./logs/rotate-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  maxSize: "10m",
});

const mongodbProdLogsTransport = new winston.transports.MongoDB({
  level: "info",
  db: process.env.MONGODB_URI,
  collection: "production_server_logs",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const mongodbTestingLogsTransport = new winston.transports.MongoDB({
  level: "info",
  db: process.env.MONGODB_URI_TEST,
  collection: "production_server_logs",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

if (process.env.NODE_ENV === "development") {
  logger.add(new winston.transports.Console());
  logger.add(mongodbDevLogsTransport);
}

if (process.env.NODE_ENV === "production") {
  if (process.env.TESTING === "truthy") {
    logger.add(mongodbTestingLogsTransport);
  } else {
    logger.add(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      })
    );
    logger.add(fileRotateTransport);
    logger.add(mongodbProdLogsTransport);
  }
}

module.exports = logger;
