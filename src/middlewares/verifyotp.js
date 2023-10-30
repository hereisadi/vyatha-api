const { OTPModel } = require("../models/Localauth/otp/otp");
const emailValidator = require("../utils/EmailValidation");

const verifyOTP = async (req, res, next) => {
  emailValidator(req, res, async () => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        error: "payload missing",
      });
    }

    const enteredOtp = otp.toString().trim();
    const generatedOtpData = await OTPModel.findOne({ email }).exec();

    if (generatedOtpData) {
      const generatedOtp = generatedOtpData.otp.toString().trim();
      if (enteredOtp !== generatedOtp) {
        return res.status(401).json({
          success: false,
          error: "otp entered is incorrect",
        });
      } else {
        await OTPModel.deleteOne({ email }).exec();
        next();
      }
    } else {
      return res.status(400).json({
        error: "No otp has been generated for the entered email",
        success: false,
      });
    }
  });
};

module.exports = {
  verifyOTP,
};
