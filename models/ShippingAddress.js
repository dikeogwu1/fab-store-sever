const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide first name"],
    minlength: 3,
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: [true, "Please provide last name"],
    minlength: 3,
    maxlength: 20,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide phone number"],
    minlength: 11,
    maxlength: 14,
  },
  streetAddress: {
    type: String,
    required: [true, "Please provide street address"],
    minlength: 6,
    maxlength: 200,
  },
  city: {
    type: String,
    required: [true, "Please provide town or city"],
    minlength: 2,
    maxlength: 30,
  },
  state: {
    type: String,
    required: [true, "Please provide name of state"],
    minlength: 2,
    maxlength: 30,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Address", AddressSchema);
