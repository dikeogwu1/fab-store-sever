const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { tokenUser, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  const user = await User.find({ role: "user" }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(
      "Unable to get users, please try again later."
    );
  }

  res.status(StatusCodes.OK).json({ user });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`No use with the id ${req.params}`);
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json(user);
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { firstName, lastName, displayName, email, oldPassword, newPassword } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !displayName ||
    !email ||
    !oldPassword ||
    !newPassword
  ) {
    throw new CustomError.BadRequestError("Please fill out all fields");
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    throw new CustomError.UnauthenticatedError("Incorrect old password");
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.displayName = displayName;
  user.email = email;
  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
    },
  });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide old and new password"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    throw new CustomError.UnauthenticatedError("Incorrect old password");
  }

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success, password updated" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
