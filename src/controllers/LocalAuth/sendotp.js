const { OTPModel } = require("../../models/Localauth/otp/otp");
const { sendEmail } = require("../../utils/EmailService");
const emailValidator = require("../../utils/EmailValidation");

// POST req to send the otp
// access: public
// role: all
// payload: email
// endpoint: /sendotp

const sendotp = async (req, res) => {
  emailValidator(req, res, async () => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "payload missing",
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      if (!otp) {
        return res.status(500).json({
          error: "otp missing",
        });
      }

      sendEmail(email, "[OTP] Vyatha Signup OTP", `Your OTP is ${otp}`);
      await OTPModel.findOneAndUpdate({ email }, { otp }, { upsert: true });

      //   const isEmailExists = await OTPModel.findOne({ email }).exec();
      //   const otpData = new OTPModel({
      //     email,
      //     otp,
      //     generatedAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
      //   });

      //   // if email exists, update the otp
      //   if (isEmailExists) {
      //     await OTPModel.findOneAndUpdate({ otpData }, { upsert: true });
      //   } else {
      //     await otpData.save();
      //   }

      // delete the otp after 15 minutes
      // code here

      res.status(200).json({
        message: "OTP sent successfully",
        success: true,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Something went wrong on server side" });
    }
  });
};

module.exports = {
  sendotp,
};
