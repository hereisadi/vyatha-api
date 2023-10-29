const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");
const { NotificationModel } = require("../../models/notification/notification");
const { v4: uuidv4 } = require("uuid");

// put request
// PUT issue mark solved
// payload: issueID
// role = supervisor
// access: private
/// endpoint : /issuesolved

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
        const { issueID } = req.body; // client should send issueID as payload
        const issue = await IssueRegModel.findById(issueID);
        if (!issue) {
          return res.status(401).json({
            error: "No such issue exists",
          });
        }

        if (issue.hostel === user.hostel) {
          if (issue.isSolved === false) {
            issue.isSolved = true; // marked as solved
            issue.solvedAt = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"); // save time
            await issue.save();

            // student notification
            const SnotificationId = uuidv4();
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
                    message: `Issue has been Solved by the Supervisor of ${issue.hostel}`,
                    isRead: false,
                    issueTitle: issue.name,
                    hostel: issue.hostel,
                  },
                ],
              });
              await sNotification.save();
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
