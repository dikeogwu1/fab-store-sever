const express = require("express");
const router = express.Router();

// Utilities
const {
  register,
  login,
  loginTestUser,
} = require("../controllers/authController");

router.post("/loginTestUser", loginTestUser);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
