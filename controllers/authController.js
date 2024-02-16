const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");

const register = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError("Email already in use");
  }

  // first registerd user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
    },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credencials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid credencials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
    },
    token,
  });
};

const loginTestUser = async (req, res) => {
  const { testUser } = req.body;
  if (testUser) {
    throw new CustomError.BadRequestError("Please confirm it's testUser");
  }

  const email = "testUser@gmail.com";
  const password = "Dikeogwu1";

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credencials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid credencials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
    },
    token,
  });
};

module.exports = { register, login, loginTestUser };
