const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");
const { NotificationModel } = require("../../models/notification/notification");

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
        const { issueId, otherID } = req.body;
        if (!issueId || !otherID) {
          return res.status(400).json({ error: "payload missing" });
        }
        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({
            success: false,
            error: "No issue found with this id",
          });
        }

        if (issue.isSolved === true) {
          return res.status(400).json({
            success: false,
            error: "Issue is solved",
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

        if (issue.email === user.email) {
          if (issue.isClosed === false) {
            issue.isClosed = true;
            issue.closedAt = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");
            await issue.save();

            const supervisorNotification = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `Issue has been closed by the student of ${user.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
            };
            notification.supervisor.push(supervisorNotification);
            await notification.save();

            // if issue has been forwarded to the warden by the supervisor, then he should also get an notification that issue has been closed

            if (issue.forwardedTo === "warden") {
              // saving notification for warden's dashboard
              const wNotification = {
                id: uuidv4(),
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been closed by the student of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.title,
                hostel: issue.hostel,
              };
              notification.warden.push(wNotification);
              await notification.save();
            }

            if (issue.forwardedTo === "dsw") {
              const newNotification = {
                id: uuidv4(),
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been closed by the student of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.title,
                hostel: issue.hostel,
              };
              notification.dsw.push(newNotification);
              await notification.save();

              const wNotification = {
                id: uuidv4(),
                time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
                message: `Issue has been closed by the student of ${user.hostel}`,
                isRead: false,
                issueTitle: issue.title,
                hostel: issue.hostel,
              };
              notification.warden.push(wNotification);
              await notification.save();
            }

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
      } else if (user.role === "supervisor") {
        const { issueId, otherID } = req.body;
        if (!issueId || !otherID) {
          return res.status(400).json({ error: "payload missing" });
        }
        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({
            success: false,
            error: "No issue found with this id",
          });
        }

        if (issue.isSolved === true) {
          return res.status(400).json({
            success: false,
            error: "Issue is solved",
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

        if (issue.isClosed === false) {
          if (user.hostel === issue.hostel) {
            issue.isClosed = true;
            issue.closedAt = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");
            await issue.save();

            // send notification to the student that your issue has been closed by the supervisor
            // student notification
            const Snotification = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `Issue has been closed by the Supervisor of ${issue.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              email: issue.email,
            };

            notification.student.push(Snotification);
            await notification.save();
            res.status(200).json({
              success: true,
              message: "Issue closed successfully",
            });
          } else {
            return res
              .status(400)
              .json({ error: "Not authorized to access this issue" });
          }
        } else {
          return res.status(401).json({ error: "Issue already closed" });
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
