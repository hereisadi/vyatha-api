const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");
const { NotificationModel } = require("../../models/notification/notification");

// get request to fetch all the issues for student, warden, supervisor, dsw and superadmin

// GET Registered issue
// role: student, supervisor, warden, dsw, superadmin
// access: private
// endpoint: /fetchissues

const fetchIssues = async (req, res) => {
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

      // for student
      if (user.role === "student") {
        const allIssues = await IssueRegModel.find({
          email: user.email,
          isClosed: false,
        }).sort({
          IssueCreatedAt: 1, // sort oldest to newest
        });

        const allNotifications = await NotificationModel.find({
          "student.email": user.email,
        }).sort({
          time: 1,
        });

        res.status(200).json({
          success: true,
          allIssues,
          allNotifications,
        });

        // for supervisor
      } else if (user.role === "supervisor") {
        const issuesAssignedToSupervisor = await IssueRegModel.find({
          // below code has been commented out as all issues should be listed in the supervisor's dashboard, moreover only supervisor can mark any issue to be solved

          // forwardedTo: "supervisor",
          hostel: user.hostel,
          isClosed: false,
        }).sort({
          IssueForwardedAtToSupervisor: +1, //  +1 for oldest to newest
        });

        const allNotifications = await NotificationModel.find({
          "supervisor.hostel": user.hostel,
        }).sort({
          time: 1,
        });

        res.status(200).json({
          success: true,
          issuesAssignedToSupervisor,
          allNotifications,
        });

        // for warden
      } else if (user.role === "warden") {
        const issuesAssignedToWarden = await IssueRegModel.find({
          forwardedTo: "warden",
          hostel: user.hostel,
          isClosed: false,
        });
        // .sort({
        //   IssueForwardedAtToWarden: +1,
        // });

        // EXPERIMENTAL MAY NOT WORK
        const sortedIssues = issuesAssignedToWarden.sort((a, b) => {
          // return new Date(b.IssueForwardedToWarden.time) - new Date(a.IssueForwardedToWarden.time);
          const timeA = moment
            .tz(a.IssueForwardedToWarden.time, "DD-MM-YY h:mma", "Asia/Kolkata")
            .toDate();

          const timeB = moment
            .tz(b.IssueForwardedToWarden.time, "DD-MM-YY h:mma", "Asia/Kolkata")
            .toDate();
          return timeA - timeB;
        });

        const allNotifications = await NotificationModel.find({
          "warden.hostel": user.hostel,
        }).sort({
          time: 1,
        });

        res.status(200).json({
          success: true,
          sortedIssues,
          allNotifications,
        });

        // for dsw
      } else if (user.role === "dsw") {
        const issuesAssignedToDsw = await IssueRegModel.find({
          forwardedTo: "dsw",
          hostel: user.hostel,
          isClosed: false,
        });
        // .sort({
        //   IssueForwardedAtToDsw: +1,
        // });

        // EXPERIMENTAL MAY NOT WORK
        const sortedIssues = issuesAssignedToDsw.sort((a, b) => {
          // return new Date(b.IssueForwardedToWarden.time) - new Date(a.IssueForwardedToWarden.time);
          const timeA = moment
            .tz(a.IssueForwardedToDsw.time, "DD-MM-YY h:mma", "Asia/Kolkata")
            .toDate();

          const timeB = moment
            .tz(b.IssueForwardedToDsw.time, "DD-MM-YY h:mma", "Asia/Kolkata")
            .toDate();
          return timeA - timeB;
        });

        const allNotifications = await NotificationModel.find({
          "dsw.hostel": user.hostel,
        }).sort({
          time: 1,
        });

        res.status(200).json({
          success: true,
          sortedIssues,
          allNotifications,
        });

        // for superadmin (vyatha team)
      } else if (user.role === "superadmin") {
        const AllRegissues = await IssueRegModel.find({ isClosed: false }).sort(
          {
            IssueCreatedAt: +1, //  +1 for oldest to newest
          }
        );

        res.status(200).json({
          sucess: true,
          AllRegissues,
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "No such role exists",
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
  fetchIssues,
};
