const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { sendEmail } = require("../../utils/EmailService");

// method: PUT
// access: private
// role: student
// endpoint: /studentdeleteaccount
// payload: none
// desc: student can delete their account

const studentDeleteAccount = async (req, res) => {
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

      const superAdmins = await SignUpModel.find({ role: "superadmin" });
      const superAdminEmails = superAdmins.map((admin) => admin.email);

      if (user.role === "student") {
        if (user.deleteAccount === "no") {
          await SignUpModel.findByIdAndUpdate(user._id, {
            deleteAccount: "scheduled",
          });

          sendEmail(
            user.email,
            "[Vyatha] Account Deletion Scheduled",
            `Hi ${user.name},\nIt's just to inform you that your account has been scheduled for deletion. It will be deleted within 15 days. You won't be able to login from now onwards.\n\n If you do not recognize this activity, please contact Vyatha team immediately.\n\n Team Vyatha`
          );

          superAdminEmails.forEach((adminEmail) => {
            sendEmail(
              adminEmail,
              "[Vyatha] Account Deletion update",
              `Hi ${adminEmail},\n ${user.name} with the email id ${user.email} has scheduled his/her account for deletion. \n\n Team Vyatha`
            );
          });

          res.status(200).json({
            message: "Account deletion scheduled successfully",
          });
        } else if (user.deleteAccount === "scheduled") {
          return res
            .status(400)
            .json({ error: "Account already scheduled for deletion" });
        }
      } else {
        return res.status(401).json({
          error: "only role with student are allowed to delete their account",
        });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  });
};

module.exports = {
  studentDeleteAccount,
};
