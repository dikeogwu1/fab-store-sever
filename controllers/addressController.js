const Address = require("../models/ShippingAddress");
const { StatusCodes } = require("http-status-codes");

const getCurrentUserAddress = async (req, res) => {
  const address = await Address.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ address, count: address.length });
};

module.exports = {
  getCurrentUserAddress,
};
