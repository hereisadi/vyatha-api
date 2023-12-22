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
  phone: {
    required: true,
    type: String,
  },
  scholarID: {
    // for student only
    type: String,
  },
  profilepic: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  password: {
    required: true,
    type: String,
  },
  hostel: {
    required: true,
    type: String,
  },
  room: {
    // for student only
    type: String,
  },
  role: {
    default: "student",
    type: String,
  },
  designation: {
    required: true,
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
  resetToken: {
    type: String,
    default: undefined,
  },
  tokenExpiration: {
    type: String,
    default: undefined,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  deleteAccount: {
    type: String,
    default: "no",
  },
});

const SignUpModel = mongoose.model("UserSignup", SignUpSchema);

module.exports = {
  SignUpModel,
};
