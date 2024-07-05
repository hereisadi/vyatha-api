const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

const logoutAllDevices = async (req, res) => {
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

      const allTokens = user.loginTokens;
      for (let i = 0; i < allTokens.length; i++) {
        allTokens[i].isTokenExpired = true;
      }
      await user.save();
      res
        .status(200)
        .json({ message: "Logged out from all devices successfully" });
    } catch (error) {
      console.error("error in logging out from all devices", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};

module.exports = {
  logoutAllDevices,
};
