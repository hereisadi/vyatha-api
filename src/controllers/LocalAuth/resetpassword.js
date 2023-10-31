const { SignUpModel } = require("../../models/Localauth/Signup");
const moment = require("moment-timezone");
const bcrypt = require("bcrypt");

// POST req to reset the password
// access: public
// role: all
// payload: password, confirmPassword, token (as params)
// endpoint: /resetpassword/:token
//  client can use uselocator to get the token from the url
// const location = useLocation();
//   const currentURL = decodeURIComponent(location.pathname);
//   const token = currentURL.split("/resetpassword/")[1];

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    const trimPassword = password.trim();
    const trimCPassword = confirmPassword.trim();

    if (!trimPassword || !trimCPassword || !token) {
      return res.status(400).json({ message: "Payload missing" });
    }

    if (trimPassword !== trimCPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // find the user by token
    const user = await SignUpModel.findOne({ resetToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid token, user not found" });
    }

    // check if token is expired
    const tokenExpiration = user.tokenExpiration;
    const currentTime = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");
    if (tokenExpiration < currentTime) {
      return res.status(400).json({ message: "Token expired" });
    } else {
      const hashedPassword = await bcrypt.hash(trimPassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.tokenExpiration = undefined;
      await user.save();
      return res.status(200).json({ message: "Password reset successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  resetPassword,
};
