const { SignUpModel } = require("../../../models/Localauth/Signup");
const moment = require("moment-timezone");

// PUT req to verify magic link
// access: public
// role: all
// payload: token as params
// endpoint: /verifyemail/:token

const verifyMagicLink = async (req, res) => {
  try {
    let token = req.params.token;
    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    token = token?.toString().trim();

    const user = await SignUpModel.findOne({
      resetToken: token,
    });

    if (!user) {
      return res.status(400).json({ message: "no user exists" });
    }

    if (user.isVerified === true) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const tokenExpiration = user.tokenExpiration;
    const currentTime = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");
    if (currentTime > tokenExpiration) {
      return res.status(400).json({ message: "Token expired" });
    } else {
      // token is valid; proceed to verify the email address i.e make isVerified = true
      user.isVerified = true;
      user.resetToken = undefined;
      user.tokenExpiration = undefined;
      await user.save();
      return res.status(200).json({ message: "Email verified" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  verifyMagicLink,
};
