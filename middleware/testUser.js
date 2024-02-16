const { BadRequestError } = require("../errors");

const blockTestUser = (req, res, next) => {
  if (req.user.displayName === "Test User") {
    throw new BadRequestError("Test User. Can not update profile");
  }
  next();
};

module.exports = blockTestUser;
