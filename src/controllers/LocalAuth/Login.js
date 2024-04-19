const bcrypt = require("bcrypt");
const { SignUpModel } = require("../../models/Localauth/Signup");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/EmailService");
const { addOneHour } = require("../../lib/expireTime");
const { OTPModel } = require("../../models/Localauth/otp/otp");
// const emailValidator = require("../../utils/EmailValidation");
require("dotenv").config();

// POST account login
// role:  all
// access: public
// endpoint: /login
// payload: email, password,time

const login = async (req, res) => {
  // emailValidator(req, res, async () => {
  let { email, password } = req.body; // client should send email and password as payload
  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  email = email?.toLowerCase().toString().trim();
  password = password?.toString().trim();

  try {
    const user = await SignUpModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "no user found" });
    }

    if (user.deleteAccount === "scheduled") {
      return res.status(401).json({ error: "Account scheduled for deletion" });
    }

    // ! for accounts that have 2fa OFF
    if (user.isTwoFactorOn === false) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "wrong email or password" });
      }

      // accept token as cookies in frontend instead of localstorage
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.YOUR_SECRET_KEY,
        { expiresIn: "720h" } // token expires after 30 days for prolonged access in case of inactivity
      );

      res
        .status(200)
        .json({ success: true, message: "Login successful", token });

      // ! for accounts that have 2fa ON
    } else if (user.isTwoFactorOn === true) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      } else {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const OTP = otp.toString().trim();
        const { time } = req.body;
        if (!time) {
          return res.status(400).json({ error: "Please provide time" });
        }
        sendEmail(
          user.email,
          `[Vyatha] 2FA Code for Login `,
          `Hello ${user.name}, \nYour 2FA OTP for login into Vyatha is ${OTP}\n\nDo not Share with anyone. Code will expire in 60 minutes.\nIf you did not request this code, your account may be compromised. Please contact us immediately at +91 8210610167\n\nThanks,\nTeam Vyatha`
        );

        const otpExpirationTime = addOneHour(time);
        const preexistingOtpData = await OTPModel.findOne({ email }).exec();
        if (preexistingOtpData) {
          await OTPModel.findOneAndUpdate(
            { email },
            { otp: OTP, otpExpiresAt: otpExpirationTime }
          );
        } else {
          const otpData = new OTPModel({
            email: user.email,
            otp: OTP,
            otpExpiresAt: otpExpirationTime,
          });
          await otpData.save();
        }

        res.status(200).json({
          message: "Proceed to verify otp page",
          userEmail: user.email,
        });
      }
    }
  } catch (error) {
    console.error("Failed to log in", error);
    res.status(500).json({ error: "Something went wrong" });
  }
  // });
};

module.exports = {
  login,
};
