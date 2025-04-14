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
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(?!.*?\s)[a-zA-Z0-9_#$@]{6,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid username`,
      },
    },
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
      enum: ["admin", "super-user", "user"],
      default: ["user"],
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);
