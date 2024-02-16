const express = require("express");
const router = express.Router();

// utilities
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const blockTestUser = require("../middleware/testUser");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, blockTestUser, updateUser);
router.route("/updatePassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
