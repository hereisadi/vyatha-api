// admin login controller function

const error = require("../../../utils/error/error");
const success = require("../../../utils/success/message");
const bcrypt = require("bcrypt");
const User = require("../../../models/admin/auth/Admin");
const jwt = require("jsonwebtoken");

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: "admin" });

    if (!user) {
      return res.status(401).json({ error: error.noUser });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({ error: error.wrongPwdEmail });
    }

    const expiresIn = 15 * 24 * 60 * 60;
    const data = {
      user: {
        _id: user._id,
        email: user.email,
        role: "admin",
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn });

    res.status(200).json({ message: success.successfulLogin, authtoken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.serverError });
  }
};

module.exports = { adminLogin };
