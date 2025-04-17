const userService = require("../services/user.services");
const secUtil = require("../utils/secUtil");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const filterObj = require("../utils/filterObjects");

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

exports.findLoggedInUserDetails = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const result = await userService.findOneById(id);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  if (!req.body.password)
    return next(new ApiError("Password cannot be empty", 400));
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

// Update firstname, lastname, email, address, phone, avatar
exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const detailsToUpdate = filterObj(
    req.body,
    "firstname",
    "lastname",
    "email",
    "address",
    "phone",
    "avatar"
  );
  const userUpdated = await userService.updateDetailsUser(
    req.user,
    detailsToUpdate
  );
  res.status(200).json({
    status: "success",
    data: userUpdated,
  });
});

exports.deleteSoftUser = catchAsync(async (req, res, next) => {
  const updatedUser = await userService.updateOneById(req.user._id, {
    isActive: false,
  });
  res.status(204).json({
    status: "success",
    data: updatedUser,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const newPasswordConfirm = req.body.newPasswordConfirm;
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(
      new ApiError(
        "You should provide current password, new password and new password confirm",
        400
      )
    );
  }
  if (newPassword !== newPasswordConfirm) {
    return next(
      new ApiError(
        "New password and new password confirm must be the same",
        400
      )
    );
  }
  const currentUser = await userService.findUserByIdIncludingPassword(
    req.user._id
  );
  if (currentUser.authProvider === "google") {
    return next(
      new ApiError(
        "You use a google account for login. You cannot change your password from this route",
        400
      )
    );
  }
  if (!(await secUtil.comparePassword(currentPassword, currentUser.password))) {
    return next(new ApiError("Unauthorized! Wrong current password", 401));
  }
  const hashedPassword = await secUtil.generateHashPassword(newPassword);
  const updatedUser = await userService.updateOneById(currentUser._id, {
    password: hashedPassword,
  });
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
