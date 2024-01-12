const { verifyToken } = require("../../middlewares/VerifyToken");
const {
  SignUpModel,
  deleteAccountModel,
} = require("../../models/Localauth/Signup");

// GET
// role: superadmin ONLY
// access: private
// endpoint: /getscheduledaccounts

const getScheduleDeleteAccount = async (req, res) => {
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

      if (user.role === "superadmin") {
        const allScheduledAccounts = await SignUpModel.find({
          deleteAccount: "scheduled",
        });

        const allDeletedAccounts = await deleteAccountModel.find({});
        res.status(200).json({
          success: true,
          allScheduledAccounts,
          allDeletedAccounts,
        });
      } else {
        return res.status(401).json({ error: "Not authorized" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

module.exports = {
  getScheduleDeleteAccount,
};
