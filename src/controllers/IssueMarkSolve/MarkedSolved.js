const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
// const moment = require("moment-timezone");
const { NotificationModel } = require("../../models/notification/notification");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../../utils/EmailService");

// put request
// PUT issue mark solved
// payload: issueID
// role = supervisor
// access: private
/// endpoint : /issuesolved

// todo: when marked as solved, its notification should go to 1) dean,warden if issue was forwarded to dsw 2) warden, if issue was forwarded to warden

const markedAsSolved = async (req, res) => {
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

      // SUPERVISOR
      if (user.role === "supervisor") {
        const { issueID, otherID, solvedAt } = req.body; // client should send issueID as payload
        if (!issueID || !otherID) {
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

        if (issue.isClosed === true) {
          return res.status(401).json({
            error: "Issue has been closed by the student, can't mark as solved",
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

        if (issue.hostel === user.hostel) {
          if (issue.isSolved === false) {
            issue.isSolved = true; // marked as solved
            issue.solvedAt = solvedAt;
            await issue.save();

            sendEmail(
              issue.email,
              `[Vyatha] Issue Marked as Solved by the Supervisor of ${issue.hostel}`,
              `Hello, ${issue.name} \n\n Your issue with the title "${issue.title}" has been marked as solved by the Supervisor.\n\n Do not forget to give the feedback whether the issue is properly solved or not. \nThanks,\n\n Team Vyatha`
            );

            // student notification
            // this will be done every time
            const Snotification = {
              id: uuidv4(),
              time: solvedAt,
              message: `Issue has been Solved by the Supervisor of ${issue.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              email: issue.email,
              issueID: issue._id,
            };

            notification.student.push(Snotification);
            await notification.save();

            if (issue.forwardedTo === "dsw") {
              // DSW NOTIFICATION
              const newNotification = {
                id: uuidv4(),
                time: solvedAt,
                message: `Issue has been marked as Solved by the Supervisor of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.title,
                hostel: issue.hostel,
                issueID: issue._id,
              };
              notification.dsw.push(newNotification);
              await notification.save();

              // WARDEN NOTIFICATION
              const notificationDetails = {
                id: uuidv4(),
                time: solvedAt,
                message: `Issue has been marked as Solved by the Supervisor of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.title,
                hostel: issue.hostel,
                issueID: issue._id,
              };
              notification.warden.push(notificationDetails);
              await notification.save();
            } else if (issue.forwardedTo === "warden") {
              // WARDEN NOTIFICATION
              const notificationDetails = {
                id: uuidv4(),
                time: solvedAt,
                message: `Issue has been marked as Solved by the Supervisor of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.title,
                hostel: issue.hostel,
                issueID: issue._id,
              };
              notification.warden.push(notificationDetails);
              await notification.save();
            }

            res.status(200).json({
              success: true,
              message: "Issue marked as solved",
            });
          } else {
            return res.status(400).json({
              success: false,
              error: "Issue already marked as solved",
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            error: "Not authorized to access this issue",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: "Only supervisor can mark an issue as solved",
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  });
};

module.exports = {
  markedAsSolved,
};
