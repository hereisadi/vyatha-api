const { SignUpModel } = require("../../models/Localauth/Signup");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const emailValidator = require("../../utils/EmailValidation");
// const { verifyOTP } = require("../../middlewares/verifyotp");

// const verifyOTP = require("../../middlewares/verifyotp");
// POST account signup
// role:  all
// access: public
// endpoint: /signup
// middleware: emailValidator and verifyOTP

// ? designations: Student, Warden, Supervisor, Dean

const signup = async (req, res) => {
  emailValidator(req, res, async () => {
    try {
      let { name, email, password, cpassword, hostel, designation, phone } =
        req.body; // client should name, email, password, cpassword, hostel and designation as payload
      if (
        !name ||
        !email ||
        !password ||
        !cpassword ||
        !hostel ||
        !designation ||
        !phone
      ) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      name = name?.toString().trim();
      email = email?.toLowerCase().toString().trim();
      password = password?.toString().trim();
      cpassword = cpassword?.toString().trim();
      hostel = hostel?.toString().trim();
      designation = designation?.toString().trim();
      phone = phone?.toString().trim();

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

      if (designation === "Student") {
        let { scholarID, room } = req.body;

        if (!scholarID || !room) {
          return res.status(400).json({ error: "missing scholarID" });
        }
        scholarID = scholarID?.toString().trim();
        room = room?.toString().trim();

        const user = new SignUpModel({
          email,
          name,
          password: hashPwd,
          accountCreatedAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          hostel,
          scholarID,
          phone,
          room,
          designation,
        });

        await user.save();
        res.status(200).json({
          success: true,
          message: "Signup successfully completed",
        });
      } else if (
        designation === "Warden" ||
        designation === "Supervisor" ||
        designation === "Dean"
      ) {
        const user = new SignUpModel({
          email,
          name,
          password: hashPwd,
          accountCreatedAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          hostel,
          phone,
          designation,
        });

        await user.save();
        res.status(200).json({
          success: true,
          message: "Signup successfully completed",
        });
      } else {
        return res.status(400).json({ error: "Invalid designation" });
      }
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
