const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

async function isValidProduct(name) {
  return !(await Product.exists({ product: name }));
}

async function findOneById(id) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(`Product with id ${id} was not found`, 404);
  return product;
}

async function findAll() {
  const products = await Product.find();
  return products;
}

async function findOneByName(name) {
  const product = await Product.findOne({ product: name });
  if (!product)
    throw new ApiError(`Product with name ${name} was not found`, 404);
  return product;
}

async function createOne(product) {
  if (!(await isValidProduct(product.product))) {
    throw new ApiError(
      `Product with name ${product.product} already exists`,
      400
    );
  }
  const newProduct = new Product(product);
  const result = await newProduct.save();
  logger.info("Product created successfully", result._doc);
  return result;
}

async function updateOneById(id, updateData) {
  if (
    updateData &&
    updateData.product &&
    !(await isValidProduct(updateData.product))
  ) {
    throw new ApiError(
      `Product with name ${updateData.product} already exists`,
      400
    );
  }
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(`Product with id ${id} was not found`, 404);
  logger.info("Product updated", product._doc);
  return product;
}

async function deleteOneById(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(`Product with id ${id} was not found`, 404);
  logger.info("Product deleted", product._doc);
  return product;
}

module.exports = {
  findOneById,
  findOneByName,
  findAll,
  createOne,
  updateOneById,
  deleteOneById,
};
