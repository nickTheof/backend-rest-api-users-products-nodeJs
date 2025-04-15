const userService = require("../services/user.services");
const secUtil = require("../utils/secUtil");

exports.findAllUsers = async (req, res, next) => {
  try {
    const result = await userService.findAll();
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.findOneUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await userService.findOneById(id);
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    const hashedPassword = await secUtil.generateHashPassword(
      req.body.password
    );
    const user = { ...req.body, password: hashedPassword };
    const result = await userService.createOne(user);
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
