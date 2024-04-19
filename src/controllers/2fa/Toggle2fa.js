const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const bcrypt = require("bcrypt");

// PUT to toggle 2fa
// access: private
// payload: accountPassword
// endpoint: /toggle2fa
// ! DESC: toggle 2fa api endpoint

const toggle2fa = async (req, res) => {
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

      const { accountPassword } = req.body;
      if (!accountPassword) {
        return res.status(400).json({ error: "Password is required" });
      }
      const isMatch = await bcrypt.compare(accountPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid Password" });
      }

      if (user.isTwoFactorOn === false) {
        user.isTwoFactorOn = true;
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Two Factor Authentication enabled",
        });
      } else if (user.isTwoFactorOn === true) {
        user.isTwoFactorOn = false;
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Two Factor Authentication disbaled",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

module.exports = { toggle2fa };
