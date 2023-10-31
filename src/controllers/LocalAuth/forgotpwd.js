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

const forgotPwd = async (req, res) => {
  emailValidator(req, res, async () => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const Email = email.toString().trim();

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
        `Click on this link to reset your password: ${resetLink} \n Link is valid for 60 minutes \n\n Team Vyatha`
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
