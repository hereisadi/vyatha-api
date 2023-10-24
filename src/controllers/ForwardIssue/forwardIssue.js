const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");

// put request
const forwardIssue = async (req, res) => {
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

      // for supervisor
      if (user.role === "supervisor") {
        const { issueID } = req.body; // client should send issueID as payload
        const issue = await IssueRegModel.findById(issueID);
        if (!issue) {
          return res.status(401).json({
            error: "No such issue exists",
          });
        }

        issue.forwardedTo = "warden";
        issue.IssueForwardedAtToWarden = moment
          .tz("Asia/Kolkata")
          .format("DD-MM-YY h:mma");
        await issue.save();
        res.status(200).json({
          success: true,
          message: "Issue forwarded successfully",
        });
      }

      // for warden
      else if (user.role === "warden") {
        const { issueID } = req.body; // client should send issueID as payload
        const issue = await IssueRegModel.findById(issueID);
        if (!issue) {
          return res.status(401).json({
            error: "No such issue exists",
          });
        }

        issue.forwardedTo = "dsw";
        issue.IssueForwardedAtToDsw = moment
          .tz("Asia/Kolkata")
          .format("DD-MM-YY h:mma");
        await issue.save();
        res.status(200).json({
          success: true,
          message: "Issue forwarded successfully",
        });
      } else {
        return res.status({
          success: false,
          error: "Not authorized to access this api endpoint",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  forwardIssue,
};
