const mongoose = require("mongoose");

const SignUpSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  hostel: {
    required: true,
    type: String,
  },
  role: {
    default: "student",
    type: String,
  },
  accountCreatedAt: {
    type: String,
  },
  rolePromotedAt: {
    type: String,
  },
  roleDemotedAt: {
    type: String,
  },
});

const SignUpModel = mongoose.model("UserSignup", SignUpSchema);

module.exports = {
  SignUpModel,
};
