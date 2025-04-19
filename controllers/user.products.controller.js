const userProductService = require("../services/user.products.services");
const catchAsync = require("../utils/catchAsync");

exports.findAllProducts = catchAsync(async (req, res, next) => {
  const products = await userProductService.findAll();
  res.status(200).json({
    status: "success",
    data: products,
  });
});

exports.findAllMyProducts = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const myProducts = await userProductService.findAllProductsByUserId(myId);
  res.status(200).json({
    status: "success",
    data: myProducts,
  });
});

exports.findAllProductsByUserId = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const myProducts = await userProductService.findAllProductsByUserId(id);
  res.status(200).json({
    status: "success",
    data: myProducts,
  });
});

exports.getUsersPurchasingStats = catchAsync(async (req, res, next) => {
  const statistics = await userProductService.findPurchasingStats();
  res.status(200).json({
    status: "success",
    data: statistics,
  });
});

exports.createProducts = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const products = req.body.products;
  const userUpdated = await userProductService.insertNewProductToAUser(
    userId,
    products
  );
  res.status(200).json({
    status: "success",
    data: userUpdated,
  });
});

exports.createProductsById = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const products = req.body.products;
  const userUpdated = await userProductService.insertNewProductToAUser(
    id,
    products
  );
  res.status(200).json({
    status: "success",
    data: userUpdated,
  });
});

exports.updateProductQuantity = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const productId = req.params.productId;
  const quantity = req.body.quantity;
  const userUpdated = await userProductService.updateProductQuantity(
    id,
    productId,
    quantity
  );
  res.status(200).json({
    status: "success",
    data: userUpdated,
  });
});

exports.updateMyQuantityOfProduct = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  const userUpdated = await userProductService.updateProductQuantity(
    id,
    productId,
    quantity
  );
  res.status(200).json({
    status: "success",
    data: userUpdated,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const productId = req.params.productId;
  const userUpdated = await userProductService.deleteProductOfAUser(
    userId,
    productId
  );
  res.status(200).json({
    status: "success",
    data: userUpdated,
  });
});
