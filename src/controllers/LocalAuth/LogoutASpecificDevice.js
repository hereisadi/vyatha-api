const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

const logoutFromASpecificDevice = async (req, res) => {
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

      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      const allTokens = user.loginTokens;
      for (let i = 0; i < allTokens.length; i++) {
        if (allTokens[i].token === token) {
          allTokens[i].isTokenExpired = true;
          await user.save();
          break;
        }
      }
      await user.save();
      res.status(200).json({ message: "that device logged out successfully" });
    } catch (error) {
      console.error("Something went wrong", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};

module.exports = {
  logoutFromASpecificDevice,
};
