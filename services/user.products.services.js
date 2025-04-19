const logger = require("../utils/logger");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");

async function findAll() {
  const result = await User.find({}, { _id: 1, username: 1, products: 1 });
  return result;
}

async function findAllProductsByUserId(id) {
  const result = await User.findOne({ _id: id }, { products: 1 });
  if (!result) throw new ApiError(`User with id ${id} was not found`, 404);
  return result;
}

async function findPurchasingStats() {
  const result = await User.aggregate([
    { $unwind: "$products" },
    {
      $project: {
        _id: 1,
        email: 1,
        products: 1,
      },
    },
    {
      $group: {
        _id: {
          email: "$email",
          product: "$products.product",
        },
        totalAmount: {
          $sum: {
            $multiply: ["$products.cost", "$products.quantity"],
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.email": 1,
        "_id.product": 1,
      },
    },
  ]);
  return result;
}

async function insertNewProductToAUser(id, products) {
  const result = await User.findByIdAndUpdate(
    id,
    {
      $push: {
        products: products,
      },
    },
    { new: true }
  );
  logger.info("New product inserted to user", result._doc);
  return result;
}

async function updateProductQuantity(userId, product_id, product_quantity) {
  const result = await User.findOneAndUpdate(
    { _id: userId, "products._id": product_id },
    {
      $set: {
        "products.$.quantity": product_quantity,
      },
    },
    { new: true }
  );
  if (!result) throw new ApiError("Product not found to update", 404);
  logger.info("Product updated successfully", result._doc);
  return result;
}

async function deleteProductOfAUser(userId, product_id) {
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, "products._id": product_id },
    { $pull: { products: { _id: product_id } } },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(`User or product not found`, 404);
  }
  return updatedUser;
}

module.exports = {
  findAll,
  findAllProductsByUserId,
  findPurchasingStats,
  insertNewProductToAUser,
  updateProductQuantity,
  deleteProductOfAUser,
};
