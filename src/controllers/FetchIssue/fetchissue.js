const { customSort } = require("../../lib/CustomSort");
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

      // ! we have to make custom sorting for the issues based on the time of creation of the issue

      // for student
      if (user.role === "student") {
        const allUnsortedIssues = await IssueRegModel.find({
          email: user.email,
          isClosed: false,
        });
        // .sort({
        //   IssueCreatedAt: -1, // sort newest to oldest
        // });

        const issueCreatedAtList = allUnsortedIssues.map(
          (issue) => issue.IssueCreatedAt
        );

        const sortedIssueCreatedAtList = customSort(issueCreatedAtList, -1);

        const allIssues = sortedIssueCreatedAtList.map((issueCreatedAt) =>
          allUnsortedIssues.find(
            (issue) => issue.IssueCreatedAt === issueCreatedAt
          )
        );

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

        const filteredStudentNotificationsUnsorted = studentData.filter(
          (student) => {
            return student.email === user.email;
          }
        );

        const notificationsTime = filteredStudentNotificationsUnsorted.map(
          (notification) => notification.time
        );
        const sortedNotificationsTime = customSort(notificationsTime, -1); // newest to oldest
        const filteredStudentNotifications = sortedNotificationsTime.map(
          (time) =>
            filteredStudentNotificationsUnsorted.find(
              (notification) => notification.time === time
            )
        );

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

        const allClosedIssuesUnsorted = await IssueRegModel.find({
          email: user.email,
          isClosed: true,
        });
        // .sort({
        //   closedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        // });

        const closedIssueTime = allClosedIssuesUnsorted.map(
          (issue) => issue.closedAt
        );
        const sortedClosedIssueTime = customSort(closedIssueTime, -1); // newest to oldest
        const allClosedIssues = sortedClosedIssueTime.map((time) =>
          allClosedIssuesUnsorted.find((issue) => issue.closedAt === time)
        );

        res.status(200).json({
          success: true,
          allIssues,
          allClosedIssues,
          filteredStudentNotifications,
          allRaisedComplaints,
        });

        // for supervisor
      } else if (user.role === "supervisor") {
        const issuesAssignedToSupervisorUnsorted = await IssueRegModel.find({
          // below code has been commented out as all issues should be listed in the supervisor's dashboard, moreover only supervisor can mark any issue to be solved

          // forwardedTo: "supervisor",
          hostel: user.hostel,
          isClosed: false,
        });
        // .sort({
        //   IssueForwardedAtToSupervisor: +1, //  +1 for oldest to newest
        // });

        const issueForwardingTime = issuesAssignedToSupervisorUnsorted.map(
          (issue) => issue.IssueForwardedAtToSupervisor
        );
        const sortedIssueForwardingTime = customSort(issueForwardingTime, 1); // oldest to newest
        const issuesAssignedToSupervisor = sortedIssueForwardingTime.map(
          (time) =>
            issuesAssignedToSupervisorUnsorted.find(
              (issue) => issue.IssueForwardedAtToSupervisor === time
            )
        );

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

        const filteredSupervisorNotificationsUnsorted = superVisorData.filter(
          (supervisor) => {
            return supervisor.hostel === user.hostel;
          }
        );
        const notificationsTime = filteredSupervisorNotificationsUnsorted.map(
          (notification) => notification.time
        );

        const sortedNotificationsTime = customSort(notificationsTime, -1); // newest to oldest

        const filteredSupervisorNotifications = sortedNotificationsTime.map(
          (time) =>
            filteredSupervisorNotificationsUnsorted.find(
              (notification) => notification.time === time
            )
        );

        // console.log(filteredSupervisorNotifications);
        // console.log(filteredSupervisorNotifications.length);

        // ? all raised complains to supervisor

        const allComplaintsRaisedToSupervisor = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length === 1;
          }
        );

        const closedIssuesAssignedToSupervisorUnsorted =
          await IssueRegModel.find({
            hostel: user.hostel,
            isClosed: true,
          });
        // .sort({
        //   closedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        // });
        const closedIssueTime = closedIssuesAssignedToSupervisorUnsorted.map(
          (issue) => issue.closedAt
        );
        const sortedClosedIssueTime = customSort(closedIssueTime, -1); // newest to oldest
        const closedIssuesAssignedToSupervisor = sortedClosedIssueTime.map(
          (time) =>
            closedIssuesAssignedToSupervisorUnsorted.find(
              (issue) => issue.closedAt === time
            )
        );

        res.status(200).json({
          success: true,
          issuesAssignedToSupervisor,
          closedIssuesAssignedToSupervisor,
          filteredSupervisorNotifications,
          allComplaintsRaisedToSupervisor,
        });

        // for warden
      } else if (user.role === "warden") {
        const sortedIssuesUnsorted = await IssueRegModel.find({
          forwardedTo: { $in: ["warden", "dsw"] },
          hostel: user.hostel,
          isClosed: false,
        });
        // .sort({
        //   IssueForwardedAtToWarden: +1, //  +1 for oldest to newest
        // });

        const issueForwardingTime = sortedIssuesUnsorted.map(
          (issue) => issue.IssueForwardedAtToWarden
        );
        const sortedIssuesTime = customSort(issueForwardingTime, 1); // oldest to newest
        const sortedIssues = sortedIssuesTime.map((time) =>
          sortedIssuesUnsorted.find(
            (issue) => issue.IssueForwardedAtToWarden === time
          )
        );

        // FETCHING NOTIFICATIONS FOR WARDEN
        const allNotifications = await NotificationModel.find({});

        const wardenData = [];

        for (const notification of allNotifications) {
          if (notification.warden && Array.isArray(notification.warden)) {
            wardenData.push(...notification.warden);
          }
        }
        // console.log(wardenData.length);

        const filteredWardenNotificationsUnsorted = wardenData.filter(
          (warden) => {
            return warden.hostel === user.hostel;
          }
        );

        const notificationsTime = filteredWardenNotificationsUnsorted.map(
          (notification) => notification.time
        );

        const sortedNotificationsTime = customSort(notificationsTime, -1); // newest to oldest

        const filteredWardenNotifications = sortedNotificationsTime.map(
          (time) =>
            filteredWardenNotificationsUnsorted.find(
              (notification) => notification.time === time
            )
        );
        // console.log(filteredWardenNotifications.length);

        const allComplaintsRaisedToWardenUnsorted = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length === 2;
          }
        );
        const forwardedIssuesTime = allComplaintsRaisedToWardenUnsorted.map(
          (issue) => issue.IssueRaisedToWardenTime
        );
        const sortedForwardedIssuesTime = customSort(forwardedIssuesTime, 1); // oldest to newest
        const allComplaintsRaisedToWarden = sortedForwardedIssuesTime.map(
          (time) =>
            allComplaintsRaisedToWardenUnsorted.find(
              (issue) => issue.IssueRaisedToWardenTime === time
            )
        );
        // .sort({
        //   IssueRaisedToWardenTime: 1, // oldest to newest
        // });

        const closedIssuesAssignedToWardenUnsorted = await IssueRegModel.find({
          forwardedTo: { $in: ["warden", "dsw"] },
          hostel: user.hostel,
          isClosed: true,
        });
        // .sort({
        //   closedAt: -1, // newest to oldest
        // });
        const clsoedIssueTime = closedIssuesAssignedToWardenUnsorted.map(
          (issue) => issue.closedAt
        );
        const sortedClosedIssueTime = customSort(clsoedIssueTime, -1); // newest to oldest
        const closedIssuesAssignedToWarden = sortedClosedIssueTime.map((time) =>
          closedIssuesAssignedToWardenUnsorted.find(
            (issue) => issue.closedAt === time
          )
        );

        res.status(200).json({
          success: true,
          sortedIssues,
          closedIssuesAssignedToWarden,
          filteredWardenNotifications,
          allComplaintsRaisedToWarden,
        });

        // for dsw
      } else if (user.role === "dsw") {
        const sortedIssuesUnsorted = await IssueRegModel.find({
          forwardedTo: "dsw",
          // hostel: user.hostel,
          isClosed: false,
        });
        // .sort({
        //   IssueForwardedAtToDsw: +1, // oldest to newest
        // });
        const issuedToDswTime = sortedIssuesUnsorted.map(
          (issue) => issue.IssueForwardedAtToDsw
        );
        const sortedIssuesTime = customSort(issuedToDswTime, 1); // oldest to newest
        const sortedIssues = sortedIssuesTime.map((time) =>
          sortedIssuesUnsorted.find(
            (issue) => issue.IssueForwardedAtToDsw === time
          )
        );

        // FETCHING NOTIFICATIONS FOR DSW
        const allNotifications = await NotificationModel.find({});

        const dswData = [];

        for (const notification of allNotifications) {
          if (notification.dsw && Array.isArray(notification.dsw)) {
            dswData.push(...notification.dsw);
          }
        }

        const notificationsTime = dswData.map(
          (notification) => notification.time
        );
        const sortedNotificationsTime = customSort(notificationsTime, -1); // newest to oldest
        const filteredDswNotifications = sortedNotificationsTime.map((time) =>
          dswData.find((notification) => notification.time === time)
        );
        // console.log(dswData.length);

        // const filteredDswNotifications = dswData.filter((dsw) => {
        //   return dsw.hostel === user.hostel;
        // });

        // const filteredDswNotifications = dswData;

        const allComplaintsRaisedToDswUnsorted = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length === 3;
          }
        );

        const raisedIssueTime = allComplaintsRaisedToDswUnsorted.map(
          (issue) => issue.IssueRaisedToDswTime
        );
        const sortedRaisedIssueTime = customSort(raisedIssueTime, 1); // oldest to newest
        const allComplaintsRaisedToDsw = sortedRaisedIssueTime.map((time) =>
          allComplaintsRaisedToDswUnsorted.find(
            (issue) => issue.IssueRaisedToDswTime === time
          )
        );
        // .sort({
        //   IssueRaisedToDswTime: +1, // oldest to newest
        // });

        const closedIssuesAssignedToDswUnsorted = await IssueRegModel.find({
          forwardedTo: "dsw",
          // hostel: user.hostel,
          isClosed: true,
        });
        // .sort({
        //   closedAt: -1, // newest to oldest
        // });
        const closedIssueTime = closedIssuesAssignedToDswUnsorted.map(
          (issue) => issue.closedAt
        );
        const sortedClosedIssueTime = customSort(closedIssueTime, -1); // newest to oldest
        const closedIssuesAssignedToDsw = sortedClosedIssueTime.map((time) =>
          closedIssuesAssignedToDswUnsorted.find(
            (issue) => issue.closedAt === time
          )
        );

        res.status(200).json({
          success: true,
          sortedIssues,
          closedIssuesAssignedToDsw,
          filteredDswNotifications,
          allComplaintsRaisedToDsw,
        });

        // for superadmin (vyatha team)
      } else if (user.role === "superadmin") {
        const AllRegissuesUnsorted = await IssueRegModel.find({
          isClosed: false,
        });
        // .sort(
        //   {
        //     IssueCreatedAt: +1, //  +1 for oldest to newest
        //   }
        // );
        const regIssueTime = AllRegissuesUnsorted.map(
          (issue) => issue.IssueCreatedAt
        );
        const sortedIssuesTime = customSort(regIssueTime, 1); // oldest to newest
        const AllRegissues = sortedIssuesTime.map((time) =>
          AllRegissuesUnsorted.find((issue) => issue.IssueCreatedAt === time)
        );

        const AllClosedissuesUnsorted = await IssueRegModel.find({
          isClosed: true,
        });
        // .sort({
        //   closedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        // });
        const closedIssueTime = AllClosedissuesUnsorted.map(
          (issue) => issue.closedAt
        );
        const sortedClosedIssueTime = customSort(closedIssueTime, -1); // newest to oldest
        const AllClosedissues = sortedClosedIssueTime.map((time) =>
          AllClosedissuesUnsorted.find((issue) => issue.closedAt === time)
        );

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
