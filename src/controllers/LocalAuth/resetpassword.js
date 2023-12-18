const { SignUpModel } = require("../../models/Localauth/Signup");
const moment = require("moment-timezone");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../utils/EmailService");

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
    let { token } = req.params;

    if (!trimPassword || !trimCPassword || !token) {
      return res.status(400).json({ message: "Payload missing" });
    }

    const trimPassword = password?.toString().trim();
    const trimCPassword = confirmPassword?.toString().trim();
    token = token?.toString().trim();

    if (trimPassword !== "" && trimPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be atleast 8 characters long",
      });
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
      // send the email to user that password has been reset
      sendEmail(
        user.email,
        "[Vyatha] Password has been reset",
        `Hi ${user.name},\nIt's just to inform you that your password has been reset successfully. If you do not recognize this activity, please contact Vyatha team immediately.\n\n Team Vyatha`
      );
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
