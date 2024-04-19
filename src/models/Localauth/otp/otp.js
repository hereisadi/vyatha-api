const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: { type: String, required: true },
});

const OTPModel = mongoose.model("OTPFor2FaLogin", otpSchema);
module.exports = {
  OTPModel,
};
