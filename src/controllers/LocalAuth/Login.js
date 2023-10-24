const bcrypt = require("bcrypt");
const { SignUpModel } = require("../../models/Localauth/Signup");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  const { email, password } = req.body; // client should email and password as payload

  try {
    const user = await SignUpModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // accept token as cookies in frontend instead of localstorage
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.YOUR_SECRET_KEY,
      { expiresIn: "720h" } // token expires after 30 days for prolonged access in case of inactivity
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Failed to log in", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  login,
};
