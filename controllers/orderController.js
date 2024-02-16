const Product = require("../models/Product");
const Order = require("../models/Order");
const Address = require("../models/ShippingAddress");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPermissions = require("../utils/checkPermissions");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "Octomber",
  "November",
  "December",
];

const sendPublicKey = async (req, res) => {
  res.status(StatusCodes.OK).json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
};

const createIntent = async (req, res) => {
  const { items: cartItems, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided.");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item._id });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No item with id : ${item._id}`);
    }
    const { name, price, images, _id } = dbProduct;
    const image = images[0].img;
    const singleOrderItems = {
      amount: item.quantity,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItems];
    // calculate subtotal
    subtotal += item.quantity * price;
  }
  // calculate total
  const total = shippingFee + subtotal;

  // get client secret
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.floor(parseFloat(total) * 100),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ clientSecret: paymentIntent.client_secret });
};

const createOrder = async (req, res) => {
  const {
    items: cartItems,
    shippingFee,
    clientSecret,
    contactDetails,
    saveInfo,
  } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No item in the cart.");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item._id });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No item with id : ${item._id}`);
    }
    const { name, price, images, _id } = dbProduct;
    const image = images[0].img;
    const singleOrderItems = {
      amount: item.quantity,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItems];
    // calculate subtotal
    subtotal += item.quantity * price;
  }
  // calculate total
  const total = shippingFee + subtotal;

  const existingAddress = await Address.findOne({ ...contactDetails });

  if (saveInfo && !existingAddress) {
    const address = await Address.create({
      ...contactDetails,
      user: req.user.userId,
    });
  }

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    date: `${
      months[new Date().getMonth()]
    }, ${new Date().getDate()}, ${new Date().getFullYear()}`,
    shippingFee,
    clientSecret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ clientSecret: order.clientSecret, orderId: order._id });
};

const getAllOrders = async (req, res) => {
  const order = await Order.find({});
  res.status(StatusCodes.OK).json({ order, count: order.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};
// const deleteOrder = async (req,res)=>{
//  res.send('delete order')
// }
const getCurrentUserOrders = async (req, res) => {
  const order = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ order, count: order.length });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getCurrentUserOrders,
  sendPublicKey,
  createIntent,
};
