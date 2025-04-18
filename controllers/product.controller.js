const catchAsync = require("../utils/catchAsync");
const productService = require("../services/product.services");

exports.findAllProducts = catchAsync(async (req, res, next) => {
  const results = await productService.findAll();
  res.status(200).json({
    status: "success",
    data: results,
  });
});

exports.findOneProductById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const result = await productService.findOneById(id);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.deleteProductById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const result = await productService.deleteOneById(id);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.createOneProduct = catchAsync(async (req, res, next) => {
  const product = req.body;
  const result = await productService.createOne(product);
  res.status(201).json({
    status: "success",
    data: result,
  });
});

exports.updateOneById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updatedProduct = req.body;
  const result = await productService.updateOneById(id, updatedProduct);
  res.status(200).json({
    status: "success",
    data: result,
  });
});
