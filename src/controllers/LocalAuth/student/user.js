// student login Controller function

const error = require("../../../utils/error/error");
const success = require("../../../utils/success/message");
const User = require("../../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: "student" });

    if (!user) {
      return res.status(401).json({ error: error.noUser });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({ error: error.wrongPwdEmail });
    }

    const expiresIn = 15 * 24 * 60 * 60; // 15 days in seconds

    const data = {
      user: {
        _id: user._id,
        email: user.email,
        role: "student",
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn });

    res.status(200).json({ message: success.successfulLogin, authtoken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.serverError });
  }
};

module.exports = { studentLogin };
