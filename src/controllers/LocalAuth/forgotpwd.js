const crypto = require("crypto");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { sendEmail } = require("../../utils/EmailService");
const emailValidator = require("../../utils/EmailValidation");
const moment = require("moment-timezone");

// POST req to forgot password
// access: public
// role: all
// payload: email
// endpoint: /forgotpassword

// alternatively to send otp for verifying the email, we can use the magic link approach. after signup, their verified status will be false. when they click to send the link to verify their email address, a magic link will be send to their email address, if token matches then their status will be turned to true. they will be able to file an issue, only when isVerified is true.

const forgotPwd = async (req, res) => {
  emailValidator(req, res, async () => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const Email = email?.toLowerCase().toString().trim();

      const user = await SignUpModel.findOne({ email: Email });
      if (!user) {
        return res.status(400).json({ message: "No account exists" });
      }

      // genertaing token using crypto
      const resetToken = crypto.randomBytes(32).toString("hex");
      //   const tokenExpiration = new Date(Date.now() + 3600000); // token valid for 60 minutes
      const tokenExpiration = moment
        .tz("Asia/Kolkata")
        .add(1, "hour")
        .format("DD-MM-YY h:mma");

      if (!resetToken || !tokenExpiration) {
        return res.status(400).json({ error: "Error in generating token" });
      }

      user.resetToken = resetToken;
      user.tokenExpiration = tokenExpiration;
      await user.save();

      const resetLink = `${process.env.website}/resetpassword/${resetToken}`;

      sendEmail(
        Email,
        "[Vyatha] Reset Password",
        `Hi ${user.name},\n We have received an request to reset your password. If this is really you, please click on the below link to set new password: \n\n ${resetLink} \n Link is valid for 60 minutes.\n\n DO NOT SHARE WITH ANYONE \n\n Team Vyatha`
      );

      res.status(200).json({
        success: true,
        message: "Reset link sent to your email",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

module.exports = {
  forgotPwd,
};
