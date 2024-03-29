const { SignUpModel } = require("../../models/Localauth/Signup");
// const moment = require("moment-timezone");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../utils/EmailService");
const { compareTimes } = require("../../lib/TimeComparison");

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
    const { password, confirmPassword, currentTime } = req.body;
    let { token } = req.params;

    if (!password || !confirmPassword || !token || !currentTime) {
      return res.status(400).json({ error: "Payload missing" });
    }

    const trimPassword = password?.toString().trim();
    const trimCPassword = confirmPassword?.toString().trim();
    token = token?.toString().trim();

    if (trimPassword !== "" && trimPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be atleast 8 characters long",
      });
    }

    if (trimPassword !== trimCPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // find the user by token
    const user = await SignUpModel.findOne({ resetToken: token });
    if (!user) {
      return res.status(400).json({ error: "Invalid token, user not found" });
    }

    // check if token is expired
    const tokenExpiration = user.tokenExpiration;
    console.log("tokenExpiration :", tokenExpiration);
    console.log("currentTime :", currentTime);
    const timeComparisonOutput = compareTimes(tokenExpiration, currentTime);
    console.log("timeComaparisonOutput", timeComparisonOutput);
    // const currentTime = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");
    if (
      timeComparisonOutput === "Time 1 is earlier than Time 2." ||
      timeComparisonOutput === "Time 1 is the same as Time 2."
    ) {
      return res.status(400).json({ error: "Token expired" });
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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  resetPassword,
};
