const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.services");

exports.login = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const response = await authService.loginUser(username, password);
  if (response.status) {
    res.status(200).json({
      status: "success",
      data: response.data,
    });
  } else {
    res.status(401).json({
      status: "fail",
      data: response.data,
    });
  }
});
