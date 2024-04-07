const { check3DayDifference } = require("../../lib/CheckIfDifference3Days");
const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const { NotificationModel } = require("../../models/notification/notification");
const { v4: uuidv4 } = require("uuid");

// access: student
// method: POST
// desc: feedback from student after the issue is marked as solved
// payload: issueID, isSatisfied, feedback, otherID,currentTime
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

        // ! since feedbackFromStudent is an array of objects, find the last object and check if isSatisfied is true then return error if further requests are made to add the feedback

        // ! make sure next feedback can only be added, after 72 hours of the last feedback

        if (issue.feedbackFromStudent.length > 0) {
          const lastFeedback =
            issue.feedbackFromStudent[issue.feedbackFromStudent.length - 1];
          if (lastFeedback.isSatisfied === true) {
            return res.status(401).json({
              error: "Satisfied Feedback already provided",
            });
          }
        }

        const lastFeedbackTime =
          issue.feedbackFromStudent.length > 0 &&
          issue.feedbackFromStudent[issue.feedbackFromStudent.length - 1].time;
        // console.log("lastFeedbackTime",lastFeedbackTime);
        const if72hoursdifference = check3DayDifference(
          lastFeedbackTime,
          req.body.currentTime
        );
        if (if72hoursdifference === "no") {
          return res.status(401).json({
            error:
              "updated feedback can be provided after 72 hours of the last feedback",
          });
        }

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

          const feedbackFromStudentobject = {
            isSatisfied: false,
            feedback: feedback,
            time: currentTime,
          };
          issue.isStudentSatisfied = "no";
          issue.feedbackFromStudent.push(feedbackFromStudentobject);

          // notify the supervisor that the student is not satisfied
          // create the notification for the all the authorities to whom issue was escalated
          const notificationDetails = {
            id: uuidv4(),
            time: currentTime,
            message: `Student is not satisfied with the issue resolution and has provided feedback`,
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
            time: currentTime,
          });
        } else {
          const { currentTime } = req.body;
          const feedbackFromStudentobject = {
            isSatisfied: true,
            time: currentTime,
          };
          issue.isStudentSatisfied = "yes";
          // ! if student has already provided not satisfied feedback, then update his feedback to satisfied then notify the every authority to whom the issue was escalated
          if (
            issue.feedbackFromStudent.length > 0 &&
            issue.feedbackFromStudent[issue.feedbackFromStudent.length - 1]
              .isSatisfied === false
          ) {
            const { otherID } = req.body;
            const notification = await NotificationModel.findOne({
              otherID: otherID,
            });

            if (!notification) {
              return res.status(401).json({
                error: "No notification exists",
              });
            }
            const notificationDetails = {
              id: uuidv4(),
              time: currentTime,
              message: `Student is now Satisfied with the issue resolution`,
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
          }

          issue.feedbackFromStudent.push(feedbackFromStudentobject);
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
