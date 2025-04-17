const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    product: {
      type: String,
      required: [true, "Product name is a required field"],
      unique: true,
      trim: true,
      maxlength: [50, "Product name too long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [400, "Product description too long"],
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0.01, "Cost must be at least 0.01"],
      set: (v) => parseFloat(v.toFixed(2)),
    },
    quantity: {
      type: Number,
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    category: {
      type: [String],
      enum: [
        "electronics",
        "clothing",
        "home",
        "beauty",
        "toys",
        "sports",
        "books",
        "food",
      ],
      required: [true, "At least one category is required"],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one category is required",
      },
    },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
