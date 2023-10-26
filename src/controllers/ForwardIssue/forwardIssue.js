const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");

// put request

// PUT forward issue
// payload: issueID, reasonForForwarding
// role = supervisor, warden
// access: private
// endpoint: /forwardissue

// client can easily issueID from the issue card.
// client should make sure forward button is disabled if no message is entered in the reasonForForwarding field

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

      // accessing payload
      const { issueID } = req.body; // client should send issueID as payload
      const { reasonForForwarding } = req.body; // client should send reasonForForwarding as payload

      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      // for supervisor
      if (user.role === "supervisor" && issue.hostel === user.hostel) {
        issue.forwardedTo = "warden";
        const forwardDetails = {
          time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          reasonForForwarding: reasonForForwarding,
        };

        issue.IssueForwardedToWarden.push(forwardDetails);
        await issue.save();
        res.status(200).json({
          success: true,
          message: "Issue forwarded successfully",
        });
      }

      // for warden
      else if (user.role === "warden" && user.hostel === issue.hostel) {
        issue.forwardedTo = "dsw";
        const forwardDetails = {
          time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          reasonForForwarding: reasonForForwarding,
        };

        issue.IssueForwardedToDsw.push(forwardDetails);
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
