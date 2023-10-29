const verifyToken = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

// PUT  to solve the issue
// role: student
// access: private
// endpoint: /closeissue
// payload: issueId

const closeIssue = async (req, res) => {
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

      if (user.role === "student") {
        const { issueId } = req.body;
        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({
            success: false,
            error: "No issue found with this id",
          });
        }

        if (issue.email === user.email) {
          if (issue.isClosed === false) {
            issue.isClosed = true;
            await issue.save();
            res.status(200).json({
              success: true,
              message: "Issue closed successfully",
            });
          } else {
            return res.status(400).json({
              success: false,
              error: "Issue already closed",
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            error: "Not authorized to access this issue",
          });
        }
      } else {
        return res
          .status(401)
          .json({ error: "Not Authorized to use this api endpoint" });
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
  closeIssue,
};
