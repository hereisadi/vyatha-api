const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const moment = require("moment-timezone");
const { IssueRegModel } = require("../../models/issues/issue");
const { v4: uuidv4 } = require("uuid");
const { NotificationModel } = require("../../models/notification/notification");

// access: private
// endpoint: /raiseComplain
// payload: issueID and otherID
// role: student
// desc: raise complain to  warden and dsw

// NOTE: ONLY role==="student" can raise the complain

// following conditions for the Raise complain button:
// 1. if the issue is solved, then the button will not be visible (implemented)
// 2. if the issue is closed, then the button will not be visible (implemented)
// 3. if the issue is forwarded to warden, then the raise button will raise the issue to dsw only (todo)
//   as of now we are disablng the raise complaint button if issue has been atleast forwarded to warden
// 4. if the issue is forwarded to dsw, then the raise button will not be visible (implemented)
//

const raiseComplain = async (req, res) => {
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
        let { issueID, otherID } = req.body;
        if (!issueID || !otherID) {
          return res
            .status(400)
            .json({ error: "Please provide issue ID and otherID" });
        }
        issueID = issueID?.toString().trim();
        otherID = otherID?.toString().trim();
        const issue = await IssueRegModel.findById(issueID);
        // const issue = await IssueRegModel.findOne({ _id: issueID });
        if (!issue) {
          return res.status(404).json({ error: "No such issue exists" });
        }

        const notification = await NotificationModel.findOne({
          otherID: otherID,
        });
        if (!notification) {
          return res.status(401).json({
            error: "No notification exists",
          });
        }

        if (issue.isClosed === true) {
          return res.status(401).json({
            error: "Issue has been closed by the student, can't raise complain",
          });
        }

        if (issue.isSolved === true) {
          return res.status(401).json({
            error: "Issue is already solved, can't raise complain",
          });
        }

        if (issue.email !== user.email) {
          return res.status(401).json({
            error: "Not authorized to access this issue",
          });
        }

        const currentTime = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");

        //supervisor by default
        const firstComplainTime = issue?.raiseComplainTo[0]?.when;
        const firstComplainRaisedTo = issue?.raiseComplainTo[0]?.whom;

        // warden
        const SecondComplainTime = issue?.raiseComplainTo[1]?.when;
        const SecondComplainRaisedTo = issue?.raiseComplainTo[1]?.whom;

        if (issue.forwardedTo === "dsw") {
          return res.status(401).json({
            error: "Issue has been forwarded to DSW, can't raise complain",
          });
        }

        // if (issue.forwardedTo === "warden") {
        //   if (
        //     moment(currentTime, "DD-MM-YY h:mma").diff(
        //       moment(issue.IssueForwardedToWarden[0].time, "DD-MM-YY h:mma"),
        //       "days"
        //     ) > 7
        //   ) {
        //     issue.raiseComplainTo.push({
        //       whom: "dsw",
        //       when: currentTime,
        //     });
        //     issue.save();
        //     return res.status(200).json({ message: "Issue raised to the dsw" });
        //   } else {
        //     return res.status(400).json({
        //       error:
        //         "Can't raise complain to DSW before 7 days before the timing of the issue forwarded to warden",
        //     });
        //   }
        // }

        if (
          issue.raiseComplainTo.length === 1 &&
          firstComplainRaisedTo === "supervisor"
        ) {
          if (
            moment(currentTime, "DD-MM-YY h:mma").diff(
              moment(firstComplainTime, "DD-MM-YY h:mma"),
              "days"
            ) > 7
          ) {
            issue.raiseComplainTo.push({
              whom: "warden",
              when: currentTime,
            });
            issue.save();

            // send notifcation to the warden and supervisor

            // WARDEN NOTIFICATION
            const notificationDetails = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `New Issue has been raised to you by the student of ${user.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              issueID: issue._id,
            };
            notification.warden.push(notificationDetails);
            await notification.save();

            // SUPERVISOR NOTIFICATION
            const newSupervisorNotification = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `Issue has been raised to the Warden by the student of ${user.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              issueID: issue._id,
            };
            notification.supervisor.push(newSupervisorNotification);
            await notification.save();

            return res
              .status(200)
              .json({ success: true, message: "Complain raised to warden" });
          } else {
            return res
              .status(401)
              .json({ error: "Can't raise complain to warden before 7 days" });
          }
        } else if (
          issue.raiseComplainTo.length === 2 &&
          SecondComplainRaisedTo === "warden"
        ) {
          if (
            moment(currentTime, "DD-MM-YY h:mma").diff(
              moment(SecondComplainTime, "DD-MM-YY h:mma"),
              "days"
            ) > 7
          ) {
            issue.raiseComplainTo.push({
              whom: "dsw",
              when: currentTime,
            });
            issue.save();

            // DSW NOTIFICATION
            const newNotification = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `New Issue has been raised to you by the student of ${user.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              issueID: issue._id,
            };
            notification.dsw.push(newNotification);
            await notification.save();

            // Warden NOTIFICATION
            const notificationDetails = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `New Issue has been raised to the DSW by the student of ${user.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              issueID: issue._id,
            };
            notification.warden.push(notificationDetails);
            await notification.save();

            // SUPERVISOR NOTIFICATION
            const newSupervisorNotification = {
              id: uuidv4(),
              time: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
              message: `Issue has been raised to the DSW by the student of ${user.hostel}`,
              isRead: false,
              issueTitle: issue.title,
              hostel: issue.hostel,
              issueID: issue._id,
            };
            notification.supervisor.push(newSupervisorNotification);
            await notification.save();

            return res
              .status(200)
              .json({ success: true, message: "Complain raised to dsw" });
          } else {
            return res
              .status(401)
              .json({ error: "Can't raise complain to dsw before 7 days" });
          }
        } else if (issue.raiseComplainTo.length === 3) {
          return res
            .status(401)
            .json({ error: "Complain already raised to dsw" });
        } else {
          return res.status(400).json({ error: "unavailable operation" });
        }
      } else {
        return res
          .status(401)
          .json({ error: "not authorized to access this endpoint" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

module.exports = {
  raiseComplain,
};
