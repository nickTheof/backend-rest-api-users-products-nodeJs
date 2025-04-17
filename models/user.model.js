const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

let addressSchema = new Schema(
  {
    area: {
      type: String,
    },
    road: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

let phoneSchema = new Schema(
  {
    type: {
      type: String,
    },
    number: {
      type: String,
    },
  },
  { _id: false }
);

let productSchema = new Schema({
  product: {
    type: String,
  },
  cost: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Email has not valid format"],
    },
    password: {
      type: String,
      select: false,
    },
    address: addressSchema,
    phone: {
      type: [phoneSchema],
      default: [],
    },
    products: {
      type: [productSchema],
      default: [],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    roles: {
      type: [String],
      enum: ["ADMIN", "EDITOR", "READER"],
      default: ["READER"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);
