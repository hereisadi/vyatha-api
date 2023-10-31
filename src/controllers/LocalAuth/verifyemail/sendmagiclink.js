const { SignUpModel } = require("../../../models/Localauth/Signup");
const { sendEmail } = require("../../../utils/EmailService");
const { verifyToken } = require("../../../middlewares/VerifyToken");
const moment = require("moment-timezone");
const crypto = require("crypto");

// POST req to send magic link
// access: private i.e after signup user will be required to login to verify their email address
// role: all
// payload: none
// endpoint: /sendmagiclink

const sendMagicLink = async (req, res) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await SignUpModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const Email = user.email.toString().trim();

      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = moment
        .tz("Asia/Kolkata")
        .add(1, "hour")
        .format("DD-MM-YY h:mma");

      if (!token || !tokenExpiration) {
        return res.status(400).json({ message: "Error in generating token" });
      }

      user.resetToken = token;
      user.tokenExpiration = tokenExpiration;
      await user.save();
      const verifyEmailLink = `${process.env.website}/verifyemail/${token}`;
      sendEmail(
        Email,
        "[Vyatha] Verify Email",
        `Click on this link to verify your email: ${verifyEmailLink} \n Link is valid for 60 minutes \n\n Team Vyatha`
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

module.exports = {
  sendMagicLink,
};
