const userService = require("../services/user.services");
const secUtil = require("../utils/secUtil");
const catchAsync = require("../utils/catchAsync");

exports.findAllUsers = catchAsync(async (req, res, next) => {
  const result = await userService.findAll();
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.findOneUserById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const result = await userService.findOneById(id);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const hashedPassword = await secUtil.generateHashPassword(req.body.password);
  const user = { ...req.body, password: hashedPassword };
  const result = await userService.createOne(user);
  res.status(200).json({
    status: "success",
    data: result,
  });
});
