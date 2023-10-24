const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

// get request

// GET all accounts
// role:  superadmin
// access: private
// endpoint: /getallaccounts

const getAllAccounts = async (req, res) => {
  verifyToken(req, res, async () => {
    try {
      // finding role of logged in user, if it has the role of superadmin then proceeds with the finding of all accounts, otherwise decline the req access of api

      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await SignUpModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { role } = user;

      // this api is only for role superadmin
      if (role === "superadmin") {
        const allAccounts = await SignUpModel.find({});

        if (!allAccounts) {
          return res.status(404).json({ error: "No accounts found" });
        }

        res.status(200).json({ success: true, allAccounts });
        // client should access allAccounts as response.data.allAccounts
      } else {
        return res
          .status(401)
          .json({ success: false, error: "Not authorized to access this api" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Something went wrong" });
    }
  });
};

module.exports = {
  getAllAccounts,
};
