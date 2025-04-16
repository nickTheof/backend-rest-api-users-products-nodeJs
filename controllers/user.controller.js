const userService = require("../services/user.services");
const secUtil = require("../utils/secUtil");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");

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
  if (!req.body.password) throw new ApiError("Password cannot be empty", 400);
  const hashedPassword = await secUtil.generateHashPassword(req.body.password);
  const user = { ...req.body, password: hashedPassword };
  const result = await userService.createOne(user);
  res.status(201).json({
    status: "success",
    data: result,
  });
});

exports.deleteOneById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const result = await userService.deleteOneById(id);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.updateOneById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updatedUser = req.body;
  const result = await userService.updateOneById(id, updatedUser);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.signupLocalUser = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if (!email || !password || !confirmPassword) {
    return next(
      new ApiError(
        "Invalid input. You should send email, password, and password confirmation"
      ),
      400
    );
  }
  if (password !== confirmPassword) {
    return next(
      new ApiError(
        "Invalid input. Password and password confirmation should be equal"
      )
    );
  }
  const hashedPassword = await secUtil.generateHashPassword(password);
  const result = await userService.createOne({
    email: email,
    password: hashedPassword,
  });
  res.status(201).json({
    status: "success",
    data: result,
  });
});
