const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.services");

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const response = await authService.loginUser(email, password);
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
