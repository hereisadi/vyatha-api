const bcrypt = require("bcrypt");
const { SignUpModel } = require("../../models/Localauth/Signup");
const jwt = require("jsonwebtoken");
const emailValidator = require("../../utils/EmailValidation");
require("dotenv").config();

// POST account login
// role:  all
// access: public
// endpoint: /login
// middleware: emailValidator

const login = async (req, res) => {
  emailValidator(req, res, async () => {
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
        return res
          .status(401)
          .json({ error: "Account scheduled for deletion" });
      }

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
    } catch (error) {
      console.error("Failed to log in", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
};

module.exports = {
  login,
};
