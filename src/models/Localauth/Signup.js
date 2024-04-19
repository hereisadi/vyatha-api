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
    // required: true,
    type: String,
  },
  scholarID: {
    // for student only
    type: String,
  },
  profilepic: {
    type: String,
    default:
      "https://res.cloudinary.com/dlx4meooj/image/upload/v1702566250/user_1_hntf9t.jpg?_s=public-apps",
  },
  idcard: {
    type: String,
    default: "",
  },
  password: {
    required: true,
    type: String,
  },
  hostel: {
    // required: true,
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
    // required: true,
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
  isTwoFactorOn: {
    type: Boolean,
    default: false,
  },
});

const SignUpModel = mongoose.model("UserSignup", SignUpSchema);
const deletedAccountSchema = new mongoose.Schema(SignUpModel.schema.obj, {
  collection: "DeletedAccounts",
});
const deleteAccountModel = mongoose.model(
  "deletedAccount",
  deletedAccountSchema
);

module.exports = {
  SignUpModel,
  deleteAccountModel,
};
