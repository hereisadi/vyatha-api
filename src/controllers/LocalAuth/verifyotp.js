const { OTPModel } = require("../../models/Localauth/otp/otp");
const emailValidator = require("../../utils/EmailValidation");

// POST req to verify the otp
// access: public
// role: all
// payload: email, otp
// endpoint: /verifyotp

const verifyOtp = async (req, res) => {
  emailValidator(req, res, async () => {
    try {
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
          res.status(200).json({
            success: true,
            message: "otp entered is correct",
          });
          //delete the otp in db after successful verification
          await OTPModel.deleteOne({ email }).exec();
        }
      } else {
        return res.status(400).json({
          error: "No otp has been generated for the entered email",
          success: false,
        });
      }

      //   if (!generatedOtp) {
      //     return res.status(400).json({
      //       error: "No otp has been generated for the entered email",
      //     });
      //   }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong on server side" });
    }
  });
};

module.exports = {
  verifyOtp,
};
