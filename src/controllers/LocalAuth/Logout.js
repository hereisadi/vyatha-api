const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

// during login process, the token is generated and stored in the database against the user email with the initial state of active, when the user logs out, the token state is changed to inactive. and when the new token is generated, the token is matched with the token stored in the database, if the token is active, the user is allowed to access the protected routes, if the token is inactive, the user is not allowed to access the protected routes.

const Logout = async (req, res) => {
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
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      console.log(allTokens);
      for (let i = 0; i < allTokens.length; i++) {
        if (allTokens[i].token === token) {
          allTokens[i].isTokenExpired = true;
          await user.save();
          break;
        }
      }

      await user.save();
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("error in logging out", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};

module.exports = {
  Logout,
};
