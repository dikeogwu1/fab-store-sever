const mongoose = require("mongoose");
const validator = require("validator");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide first name"],
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, "Please provide last name"],
    minlength: 3,
    maxlength: 50,
  },
  displayName: {
    type: String,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  const salt = await bycrypt.genSalt(10);
  this.password = await bycrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName && this.displayName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFE_DURATION,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bycrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
