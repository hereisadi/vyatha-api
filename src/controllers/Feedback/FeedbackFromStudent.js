const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const { NotificationModel } = require("../../models/notification/notification");
const { v4: uuidv4 } = require("uuid");

// access: student
// method: POST
// desc: feedback from student after the issue is marked as solved
// payload: issueID, isSatisfied, feedback, otherID
// private
// endpoint: /feedback

const feedbackFromStudent = async (req, res) => {
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

      // issueID in the form of string
      // isSatisfied in the form of boolean

      if (user.role === "student") {
        const { issueID, isSatisfied } = req.body;

        if (!issueID || isSatisfied === undefined || isSatisfied === null) {
          return res.status(400).json({
            success: false,
            error: "missing issueid and isSatisfied",
          });
        }

        const issue = await IssueRegModel.findById(issueID);
        if (!issue) {
          return res.status(401).json({
            error: "No such issue exists",
          });
        }

        if (!issue.isSolved) {
          return res.status(401).json({
            error: "Issue is not solved yet",
          });
        }

        // if(issue.feedbackFromStudent.isSatisfied===true || issue.feedbackFromStudent.isSatisfied===false){
        //     return res.status(401).json({
        //         error: "Feedback already provided",
        //     });
        // }

        if (isSatisfied === false) {
          let { feedback } = req.body;
          const { otherID, currentTime } = req.body;
          if (!otherID) {
            return res.status(400).json({
              success: false,
              error: "missing otherID reqd for notification",
            });
          }
          if (!feedback) {
            return res.status(400).json({
              success: false,
              error: "missing feedback",
            });
          }
          feedback = feedback.toString().trim();
          const notification = await NotificationModel.findOne({
            otherID: otherID,
          });

          if (!notification) {
            return res.status(401).json({
              error: "No notification exists",
            });
          }

          issue.feedbackFromStudent = {
            isSatisfied: false,
            feedback: feedback,
          };

          // notify the supervisor that the student is not satisfied
          // create the notification for the all the authorities to whom issue was escalated
          const notificationDetails = {
            id: uuidv4(),
            time: currentTime,
            message: `Student is not satisfied with the resolution of the issue and has provided feedback`,
            isRead: false,
            issueTitle: issue.title,
            hostel: issue.hostel,
            issueID: issue._id,
          };

          if (issue.forwardedTo === "dsw") {
            // create notification for dsw, warden and supervisor
            notification.dsw.push(notificationDetails);
            notification.warden.push(notificationDetails);
            notification.supervisor.push(notificationDetails);
            await notification.save();
          } else if (issue.forwardedTo === "warden") {
            // create notification for warden,supervisor
            notification.warden.push(notificationDetails);
            notification.supervisor.push(notificationDetails);
            await notification.save();
          } else if (issue.forwardedTo === "supervisor") {
            // create notification for supervisor
            notification.supervisor.push(notificationDetails);
            await notification.save();
          }
          await issue.save();
          return res.status(200).json({
            success: true,
            message: "Feedback saved successfully",
          });
        } else {
          issue.feedbackFromStudent = {
            isSatisfied: true,
          };

          await issue.save();
          return res.status(200).json({
            success: true,
            message: "Feedback saved successfully",
          });
        }
      } else {
        return res
          .status(401)
          .json({ error: "Unauthorized to access this endpoint" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

module.exports = {
  feedbackFromStudent,
};
