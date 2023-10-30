const { SignUpModel } = require("../../models/Localauth/Signup");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const emailValidator = require("../../utils/EmailValidation");
const { verifyOTP } = require("../../middlewares/verifyotp");

// const verifyOTP = require("../../middlewares/verifyotp");
// POST account signup
// role:  all
// access: public
// endpoint: /signup
// middleware: emailValidator and verifyOTP

const signup = async (req, res) => {
  emailValidator(req, res, async () => {
    try {
      const { name, email, password, cpassword, hostel } = req.body; // client should name, email, password and cpassword as payload
      if (!name || !email || !password || !cpassword || !hostel) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ error: "Password should not be less than 8 characters" });
      }

      if (password !== cpassword) {
        return res.status(400).json({
          error: "Passwords must match",
        });
      }

      const existingSignup = await SignUpModel.findOne({ email });
      if (existingSignup) {
        return res.status(400).json({
          success: false,
          error: "Signup with this email already exists",
        });
      }

      const hashPwd = await bcrypt.hash(password, 10);

      const user = new SignUpModel({
        email,
        name,
        password: hashPwd,
        accountCreatedAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
        hostel,
      });

      verifyOTP(req, res, async () => {
        await user.save();
        res.status(200).json({
          success: true,
          message: "Signup successfully completed",
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong",
      });
    }
  });
};

module.exports = {
  signup,
};
