const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getCurrentUserOrders,
  sendPublicKey,
  createIntent,
} = require("../controllers/orderController");

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);
router.route("/config").get(sendPublicKey);
router.route("/intent").post(createIntent);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
