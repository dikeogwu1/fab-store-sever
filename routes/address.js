const express = require("express");
const router = express.Router();

const { getCurrentUserAddress } = require("../controllers/addressController");

const { authenticateUser } = require("../middleware/authentication");

router.route("/showAllMyAddress").get(authenticateUser, getCurrentUserAddress);

module.exports = router;
