const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
// delete request to delete the  account

// DELETE account
// role: superadmin ONLY
// payload: accountID
// access: private
// endpoint: /deleteaccount

const deleteAccount = (req, res) => {
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
        if (!accountID) {
          return res.status(401).json({
            error: "No such account exists",
          });
        }

        const account = await SignUpModel.findById(accountID);

        if (!account) {
          return res.status(401).json({
            error: "No such account exists",
          });
        }

        // const { role } = account;

        // only account with the role of student should be deleted as supervisor, warden and dsw are also some form of admin

        if (account.role === "student") {
          await SignUpModel.findOneAndDelete({ accountID });
          res.status(200).json({
            success: true,
            message: "account deleted successfully",
          });
        } else {
          res.status(401).json({
            error:
              "No such deletion account control of other role exists as of now",
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
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  deleteAccount,
};
