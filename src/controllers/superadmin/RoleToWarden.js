const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const moment = require("moment-timezone");
// put request to update the role to warden

// PUT promote to warden role
// payload: accountID
// role : superadmin
// access : private
// endpoint : /promotetowarden

const roleToWarden = (req, res) => {
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

      const { role } = user;

      if (role === "superadmin") {
        const { accountID } = req.body; // client should send accountID as payload
        const account = await SignUpModel.findById(accountID);
        if (!account) {
          return res.status(401).json({
            error: "No such account exists",
          });
        }

        // const { role } = account;

        if (account.role === "student") {
          account.role = "warden";
          account.rolePromotedAt = moment
            .tz("Asia/Kolkata")
            .format("DD-MM-YY h:mma");
          await account.save();
          res.status(200).json({
            success: true,
            message: "Role elevated to warden successfully",
          });
        } else {
          res.status(401).json({
            error: "No such role exists",
          });
        }
      } else {
        return res
          .status(401)
          .json({ success: false, error: "Not authorized to access this api" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong",
      });
    }
  });
};

module.exports = {
  roleToWarden,
};
