const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.services");
const userService = require("../services/user.services");
const ApiError = require("../utils/apiError");

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
      message: response.data,
    });
  }
});

exports.googleLogin = catchAsync(async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    return next(new ApiError("Authorization code is missing", 400));
  } else {
    let response = await authService.googleAuth(code);
    if (response.status) {
      // if the user is not in the database, we will create one with info from the google account
      if (await userService.isValidEmail(response.user.email)) {
        await userService.createUserFromGoogle(response.user);
      }
      // Sign a JWT token and send it
      const userDetailsForToken = await userService.findUserDetailsForJWT(
        response.user.email
      );
      if (!userDetailsForToken.isActive) {
        return next(new ApiError("Unauthorized. User is inactive.", 401));
      }
      const token = authService.generateAccessToken(userDetailsForToken);
      res.status(200).json({
        status: "success",
        data: token,
      });
    } else {
      next(new ApiError("Problem in Google Login", 400));
    }
  }
});
