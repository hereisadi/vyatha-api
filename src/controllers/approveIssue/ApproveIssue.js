const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const { NotificationModel } = require("../../models/notification/notification");
const moment = require("moment-timezone");
const uuid = require("uuidv4");

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

      const { issueID } = req.body; //client should send issueID as payload

      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      // WARDEN
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
        const notificationId = uuid();
        const existingNotification = await NotificationModel.findOne({
          "supervisor.id": notificationId,
        });

        // store as notification in NotificationModel and fetch it in the supervisor's dashboard
        if (existingNotification) {
          existingNotification.message = "message updated";
          await existingNotification.save();
        } else {
          const notification = new NotificationModel({
            supervisor: [
              {
                id: uuid(),
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been approved by the Warden of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.name,
                hostel: issue.hostel,
              },
            ],
          });
          await notification.save();
        }

        // student notification
        const SnotificationId = uuid();
        const studentNotification = await NotificationModel.findOne({
          "student.id": SnotificationId,
        });

        if (studentNotification) {
          //
          studentNotification.message = "message updated";
          await studentNotification.save();
        } else {
          //
          const sNotification = new NotificationModel({
            student: [
              {
                id: issue._id,
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been approved by the Warden of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.name,
                hostel: issue.hostel,
                email: issue.email,
              },
            ],
          });
          await sNotification.save();
        }

        res.status(200).json({
          success: true,
          message: "Issue approved successfully by the warden",
        });
      }

      //DSW
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
        const notificationId = uuid();
        const existingNotification = await NotificationModel.findOne({
          "warden.id": notificationId,
        });

        // store as notification in NotificationModel and fetch it in the warden's dashboard
        if (existingNotification) {
          existingNotification.message = "message updated";
          await existingNotification.save();
        } else {
          const notification = new NotificationModel({
            warden: [
              {
                id: uuid(),
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been approved by the DSW of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.name,
                hostel: issue.hostel,
              },
            ],
          });
          await notification.save();
        }

        // student notification
        const SnotificationId = uuid();
        const studentNotification = await NotificationModel.findOne({
          "student.id": SnotificationId,
        });

        if (studentNotification) {
          studentNotification.message = "message updated";
          await studentNotification.save();
        } else {
          const sNotification = new NotificationModel({
            student: [
              {
                id: issue._id,
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been approved by the DSW of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.name,
                hostel: issue.hostel,
                email: issue.email,
              },
            ],
          });
          await sNotification.save();
        }

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
