const CustomError = require("../errors");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer")) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }

  const token = authHeaders.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach the user to the job route

    req.user = {
      userId: payload.userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: payload.displayName,
    };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnathorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
