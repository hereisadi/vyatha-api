const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
// const moment = require("moment-timezone");
const { NotificationModel } = require("../../models/notification/notification");

// get request to fetch all the issues for student, warden, supervisor, dsw and superadmin

// GET Registered issue
// role: student, supervisor, warden, dsw, superadmin
// access: private
// endpoint: /fetchissues

// sorting is done on the basis of issues creation time for student, and forwarding time for supervisor,warden and dsw
const fetchIssues = async (req, res) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await SignUpModel.findById(userId);

      if (!user) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
      }

      const allComplains = await IssueRegModel.find({});

      // for student
      if (user.role === "student") {
        const allIssues = await IssueRegModel.find({
          email: user.email,
          isClosed: false,
        }).sort({
          IssueCreatedAt: -1, // sort newest to oldest
        });

        const allNotifications = await NotificationModel.find({});

        // console.log(typeof allNotifications);
        // console.log(allNotifications);

        const studentData = [];

        for (const notification of allNotifications) {
          if (notification.student && Array.isArray(notification.student)) {
            studentData.push(...notification.student);
          }
        }
        // console.log(studentData.length);

        const filteredStudentNotifications = studentData.filter((student) => {
          return student.email === user.email;
        });

        // console.log(filteredStudentData);

        // ? fetching the raised complains by the user:

        const allComplaintsRaisedAboveSupervisor = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length > 1;
          }
        );

        let allRaisedComplaints = [];
        for (let i = 0; i < allComplaintsRaisedAboveSupervisor.length; i++) {
          if (allComplaintsRaisedAboveSupervisor[i].email === user.email) {
            allRaisedComplaints.push(allComplaintsRaisedAboveSupervisor[i]);
          }
        }

        const allClosedIssues = await IssueRegModel.find({
          email: user.email,
          isClosed: true,
        }).sort({
          closedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        });

        res.status(200).json({
          success: true,
          allIssues,
          allClosedIssues,
          filteredStudentNotifications,
          allRaisedComplaints,
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

        const allNotifications = await NotificationModel.find({});

        const superVisorData = [];

        for (const notification of allNotifications) {
          if (
            notification.supervisor &&
            Array.isArray(notification.supervisor)
          ) {
            superVisorData.push(...notification.supervisor);
          }
        }
        // console.log(superVisorData.length);

        const filteredSupervisorNotifications = superVisorData.filter(
          (supervisor) => {
            return supervisor.hostel === user.hostel;
          }
        );

        // console.log(filteredSupervisorNotifications);
        // console.log(filteredSupervisorNotifications.length);

        // ? all raised complains to supervisor

        const allComplaintsRaisedToSupervisor = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length === 1;
          }
        );

        const closedIssuesAssignedToSupervisor = await IssueRegModel.find({
          hostel: user.hostel,
          isClosed: true,
        }).sort({
          closedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        });

        res.status(200).json({
          success: true,
          issuesAssignedToSupervisor,
          closedIssuesAssignedToSupervisor,
          filteredSupervisorNotifications,
          allComplaintsRaisedToSupervisor,
        });

        // for warden
      } else if (user.role === "warden") {
        const sortedIssues = await IssueRegModel.find({
          forwardedTo: { $in: ["warden", "dsw"] },
          hostel: user.hostel,
          isClosed: false,
        }).sort({
          IssueForwardedAtToWarden: +1, //  +1 for oldest to newest
        });

        // FETCHING NOTIFICATIONS FOR WARDEN
        const allNotifications = await NotificationModel.find({});

        const wardenData = [];

        for (const notification of allNotifications) {
          if (notification.warden && Array.isArray(notification.warden)) {
            wardenData.push(...notification.warden);
          }
        }
        // console.log(wardenData.length);

        const filteredWardenNotifications = wardenData.filter((warden) => {
          return warden.hostel === user.hostel;
        });

        // console.log(filteredWardenNotifications.length);

        const allComplaintsRaisedToWarden = allComplains
          .filter((complain) => {
            return complain.raiseComplainTo.length === 2;
          })
          .sort({
            IssueRaisedToWardenTime: 1, // oldest to newest
          });

        const closedIssuesAssignedToWarden = await IssueRegModel.find({
          forwardedTo: { $in: ["warden", "dsw"] },
          hostel: user.hostel,
          isClosed: true,
        }).sort({
          closedAt: -1, // newest to oldest
        });

        res.status(200).json({
          success: true,
          sortedIssues,
          closedIssuesAssignedToWarden,
          filteredWardenNotifications,
          allComplaintsRaisedToWarden,
        });

        // for dsw
      } else if (user.role === "dsw") {
        const sortedIssues = await IssueRegModel.find({
          forwardedTo: "dsw",
          // hostel: user.hostel,
          isClosed: false,
        }).sort({
          IssueForwardedAtToDsw: +1, // oldest to newest
        });

        // FETCHING NOTIFICATIONS FOR DSW
        const allNotifications = await NotificationModel.find({});

        const dswData = [];

        for (const notification of allNotifications) {
          if (notification.dsw && Array.isArray(notification.dsw)) {
            dswData.push(...notification.dsw);
          }
        }
        // console.log(dswData.length);

        // const filteredDswNotifications = dswData.filter((dsw) => {
        //   return dsw.hostel === user.hostel;
        // });

        const filteredDswNotifications = dswData;

        const allComplaintsRaisedToDsw = allComplains
          .filter((complain) => {
            return complain.raiseComplainTo.length === 3;
          })
          .sort({
            IssueRaisedToDswTime: +1, // oldest to newest
          });

        const closedIssuesAssignedToDsw = await IssueRegModel.find({
          forwardedTo: "dsw",
          // hostel: user.hostel,
          isClosed: true,
        }).sort({
          closedAt: -1, // newest to oldest
        });

        res.status(200).json({
          success: true,
          sortedIssues,
          closedIssuesAssignedToDsw,
          filteredDswNotifications,
          allComplaintsRaisedToDsw,
        });

        // for superadmin (vyatha team)
      } else if (user.role === "superadmin") {
        const AllRegissues = await IssueRegModel.find({ isClosed: false }).sort(
          {
            IssueCreatedAt: +1, //  +1 for oldest to newest
          }
        );

        const AllClosedissues = await IssueRegModel.find({
          isClosed: true,
        }).sort({
          closedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        });

        res.status(200).json({
          sucess: true,
          AllRegissues,
          AllClosedissues,
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
