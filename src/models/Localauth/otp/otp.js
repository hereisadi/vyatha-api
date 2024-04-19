const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String },
  otpExpiresAt: { type: String },
});

const OTPModel = mongoose.model("OTPFor2FaLogin", otpSchema);
module.exports = {
  OTPModel,
};
