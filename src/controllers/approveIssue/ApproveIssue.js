const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const { NotificationModel } = require("../../models/notification/notification");
const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");

// PUT approve issue
// role: warden, dsw
// access: private
// endpoint: /approveissue
// payload : issueID

const approveIssue = (req, res) => {
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

      const { issueID, otherID } = req.body; //client should send issueID as payload

      if (!otherID || !issueID) {
        return res.status(400).json({
          error: "payload missing",
        });
      }

      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      const notification = await NotificationModel.findOne({
        otherID: otherID,
      });
      if (!notification) {
        return res.status(401).json({
          error: "No notification exists",
        });
      }

      // WARDEN APPROVE
      if (
        user.role === "warden" &&
        issue.hostel === user.hostel &&
        issue.forwardedTo === "warden"
      ) {
        issue.IssueForwardedToWarden[
          issue.IssueForwardedToWarden.length - 1
        ].isApproved = true;
        await issue.save();

        // saving notification for supervisor's dashboard
        const supervisorNotification = {
          id: uuidv4(),
          time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          message: `Issue has been approved by the Warden of ${user.hostel}`,
          isRead: false,
          issueTitle: issue.name,
          hostel: issue.hostel,
        };
        notification.supervisor.push(supervisorNotification);
        await notification.save();

        // student notification
        const sNotification = {
          id: uuidv4(),
          time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          message: `Issue has been approved by the Warden of ${user.hostel}`,
          isRead: false,
          issueTitle: issue.name,
          hostel: issue.hostel,
          email: issue.email,
        };
        notification.student.push(sNotification);
        await notification.save();

        res.status(200).json({
          success: true,
          message: "Issue approved successfully by the warden",
        });
      }

      //DSW APPROVAL
      else if (
        user.role === "dsw" &&
        issue.hostel === user.hostel &&
        issue.forwardedTo === "dsw"
      ) {
        issue.IssueForwardedToDsw[
          issue.IssueForwardedToDsw.length - 1
        ].isApproved = true;
        await issue.save();

        // saving notification for warden's dashboard
        const wNotification = {
          id: uuidv4(),
          time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          message: `Issue has been approved by the DSW of ${user.hostel}`,
          isRead: false,
          issueTitle: issue.name,
          hostel: issue.hostel,
        };
        notification.warden.push(wNotification);
        // saving notification for supervisor's dashboard
        notification.supervisor.push(wNotification);
        await notification.save();

        // student notification
        const sNotification = {
          id: uuidv4(),
          time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
          message: `Your Issue has been approved by the DSW of ${user.hostel}`,
          isRead: false,
          issueTitle: issue.name,
          hostel: issue.hostel,
          email: issue.email,
        };
        notification.student.push(sNotification);
        await notification.save();

        res.status(200).json({
          success: true,
          message: "Issue approved successfully by the dsw",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "No other role are authorized to approve an issue",
        });
      }

      //   if (user.role === "warden") {
      //     if (issue.hostel === user.hostel) {
      //       if (issue.forwardedTo === "warden") {
      //         issue.IssueForwardedToWarden[
      //           issue.IssueForwardedToWarden.length - 1
      //         ].isApproved = true;
      //         await issue.save();
      //         res.status(200).json({
      //           success: true,
      //           message: "Issue approved successfully by the warden",
      //         });
      //       }
      //     } else {
      //       return res.status(400).json({
      //         success: false,
      //         error: "Not authorized to approve an issue for hostel than yours",
      //       });
      //     }
      //   } else if (user.role === "dsw") {
      //     if (issue.hostel === user.hostel) {
      //       if (issue.forwardedTo === "dsw") {
      //         //
      //       }
      //     } else {
      //       return res.status(400).json({
      //         success: false,
      //         error: "Not authorized to approve an issue for hostel than yours",
      //       });
      //     }
      //   } else {
      //     return res.status(400).json({
      //       success: false,
      //       error: "No other role are authorized to approve an issue",
      //     });
      //   }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  approveIssue,
};
