const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");
const { NotificationModel } = require("../../models/notification/notification");
const { v4: uuidv4 } = require("uuid");

// put request

// PUT forward issue
// payload: issueID, reasonForForwarding, otherID
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
      const { issueID, reasonForForwarding, otherID } = req.body; // client should send issueID, reasonForForwarding and otherID as payload

      if (!issueID || !reasonForForwarding || !otherID) {
        return res.status(400).json({
          success: false,
          error: "body incomplete",
        });
      }

      const issue = await IssueRegModel.findById(issueID);
      const notification = await NotificationModel.findOne({
        otherID: otherID,
      });

      if (!notification) {
        return res.status(401).json({
          error: "No notification exists",
        });
      }
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      // for supervisor
      if (user.role === "supervisor" && issue.hostel === user.hostel) {
        if (issue.forwardedTo === "supervisor") {
          issue.forwardedTo = "warden";
          const forwardDetails = {
            time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            reasonForForwarding: reasonForForwarding,
          };

          issue.IssueForwardedToWarden.push(forwardDetails);
          await issue.save();

          // WARDEN NOTIFICATION
          const notificationDetails = {
            id: uuidv4(),
            time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            message: `New Issue has been forwarded to you by the supervisor of ${user.hostel}`,
            isRead: false,
            issueTitle: issue.name,
            hostel: issue.hostel,
          };
          notification.warden.push(notificationDetails);
          await notification.save();

          // STUDENT NOTIFICATION
          const SnotificationId = uuidv4();
          const studentNotification = await NotificationModel.findOne({
            "student.id": SnotificationId,
          });

          if (studentNotification) {
            studentNotification.message = "message updated";
            await studentNotification.save();
          } else {
            const SnotificationDetails = {
              id: issue._id,
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `Your Issue has been forwarded to the warden of ${user.hostel} by the Supervisor`,
              isRead: false,
              issueTitle: issue.name,
              hostel: issue.hostel,
              email: issue.email,
            };
            notification.student.push(SnotificationDetails);
            await notification.save();
          }
        } else if (issue.forwardedTo === "warden") {
          return res.status(400).json({
            success: false,
            error: "Issue already forwarded to warden",
          });
        } else {
          return res.status(400).json({
            success: false,
            error: "Issue hasn't received by supervisor yet",
          });
        }

        res.status(200).json({
          success: true,
          message: "Issue forwarded successfully and notification saved",
        });
      }

      // FOR WARDEN
      else if (user.role === "warden" && user.hostel === issue.hostel) {
        if (issue.forwardedTo === "warden") {
          issue.forwardedTo = "dsw";

          const forwardDetails = {
            time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            reasonForForwarding: reasonForForwarding,
          };
          issue.IssueForwardedToDsw.push(forwardDetails);
          await issue.save();

          // DSW NOTIFICATION
          const newNotification = {
            id: uuidv4(),
            time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            message: `New Issue has been forwarded to you by the warden of ${user.hostel}`,
            isRead: false,
            issueTitle: issue.name,
            hostel: issue.hostel,
          };
          notification.dsw.push(newNotification);
          await notification.save();

          // SUPERVISOR NOTIFICATION
          const newSupervisorNotification = {
            id: uuidv4(),
            time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            message: `Issue has been forwarded to the DSW by the warden of ${user.hostel}`,
            isRead: false,
            issueTitle: issue.name,
            hostel: issue.hostel,
          };
          notification.supervisor.push(newSupervisorNotification);
          await notification.save();

          // STUDENT NOTIFICATION
          const sNotification = {
            id: uuidv4(),
            time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            message: `Your Issue has been forwarded to the DSW of ${user.hostel} by the Warden`,
            isRead: false,
            issueTitle: issue.name,
            hostel: issue.hostel,
            email: issue.email,
          };
          notification.student.push(sNotification);
          await notification.save();

          res.status(200).json({
            success: true,
            message: "Issue forwarded successfully and notification saved",
          });
        } else if (issue.forwardedTo === "dsw") {
          return res.status(400).json({
            success: false,
            error: "Issue already forwarded to DSW",
          });
        } else {
          return res.status(400).json({
            success: false,
            error: "Issue has not been forwarded to warden yet",
          });
        }

        res.status(200).json({
          success: true,
          message: "Issue forwarded successfully and notification saved",
        });
      } else {
        return res.status(400).json({
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
