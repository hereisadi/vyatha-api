const { compareTimes } = require("../../../lib/TimeComparison");
const { SignUpModel } = require("../../../models/Localauth/Signup");
const { OTPModel } = require("../../../models/Localauth/otp/otp");
const jwt = require("jsonwebtoken");

// ! DESC:  POST to verify 2fa code api endpoint
// ! ACCESS: private
// ! ENDPOINT: /verifycodeforlogin
// ! PAYLOAD: email, enteredOtp, currentTime

const verify2faCodeForLogin = async (req, res) => {
  try {
    const { email, enteredOtp, currentTime } = req.body;
    if (!email || !enteredOtp || !currentTime) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const user = await SignUpModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otpData = await OTPModel.findOne({ email }).exec();
    if (!otpData) {
      return res.status(400).json({ error: "no otp has been generated" });
    } else {
      const enteredOTP = enteredOtp.toString().trim();
      const storedOTP = otpData.otp?.trim();
      const otpExpiresAt = otpData.otpExpiresAt;
      const timeComparisonOutput = compareTimes(otpExpiresAt, currentTime);
      if (
        timeComparisonOutput === "Time 1 is earlier than Time 2." ||
        timeComparisonOutput === "Time 1 is the same as Time 2."
      ) {
        return res.status(400).json({ error: "otp expired" });
      } else {
        if (enteredOTP !== storedOTP) {
          return res.status(401).json({ error: "wrong otp" });
        } else {
          await OTPModel.findOneAndDelete({ email: email });
          const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.YOUR_SECRET_KEY,
            { expiresIn: "720h" }
          );

          res
            .status(200)
            .json({ success: true, message: "Login successful", token });
        }
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong on the server side",
    });
  }
};

module.exports = { verify2faCodeForLogin };
