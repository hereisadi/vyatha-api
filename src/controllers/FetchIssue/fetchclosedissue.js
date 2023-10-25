const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

// GET TO FETCH CLOSED ISSUE
// access: private
// role: student, supervisor, warden, dsw, superadmin
// endpoint: /fetchclosedissue

const fetchClosedIssue = (req, res) => {
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
          isClosed: true,
        }).sort({
          IssueCreatedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        });
        res.status(200).json({
          success: true,
          allIssues,
        });
      }

      // for supervisor
      else if (user.role === "supervisor") {
        const issuesAssignedToSupervisor = await IssueRegModel.find({
          forwardedTo: "supervisor",
          hostel: user.hostel,
          isClosed: true,
        }).sort({
          IssueForwardedAtToSupervisor: -1, // sort from newest to oldest; +1 for oldest to newest
        });
        res.status(200).json({
          success: true,
          issuesAssignedToSupervisor,
        });
      }

      // for warden
      else if (user.role === "warden") {
        const issuesAssignedToWarden = await IssueRegModel.find({
          forwardedTo: "warden",
          hostel: user.hostel,
          isClosed: true,
        }).sort({
          IssueForwardedAtToWarden: -1,
        });

        res.status(200).json({
          success: true,
          issuesAssignedToWarden,
        });

        //for dsw
      } else if (user.role === "dsw") {
        const issuesAssignedToDsw = await IssueRegModel.find({
          forwardedTo: "dsw",
          hostel: user.hostel,
          isClosed: true,
        }).sort({
          IssueForwardedAtToDsw: -1,
        });

        res.status(200).json({
          success: true,
          issuesAssignedToDsw,
        });
      }

      // for superadmin
      else if (user.role === "superadmin") {
        const AllRegissues = await IssueRegModel.find({ isClosed: true }).sort({
          IssueCreatedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        });

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
        success: false,
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  fetchClosedIssue,
};
