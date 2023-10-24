const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

// get request to fetch all the issues for student, warden, supervisor, dsw and superadmin

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
        const allIssues = await IssueRegModel.find({ email: user.email }).sort({
          IssueCreatedAt: -1, // sort from newest to oldest; +1 for oldest to newest
        });
        res.status(200).json({
          success: true,
          allIssues,
        });

        // for supervisor
      } else if (user.role === "supervisor") {
        const issuesAssignedToSupervisor = await IssueRegModel.find({
          forwardedTo: "supervisor",
        }).sort({
          IssueForwardedAtToSupervisor: -1, // sort from newest to oldest; +1 for oldest to newest
        });
        res.status(200).json({
          success: true,
          issuesAssignedToSupervisor,
        });

        // for warden
      } else if (user.role === "warden") {
        const issuesAssignedToWarden = await IssueRegModel.find({
          forwardedTo: "warden",
        }).sort({
          IssueForwardedAtToWarden: -1,
        });

        res.status(200).json({
          success: true,
          issuesAssignedToWarden,
        });

        // for dsw
      } else if (user.role === "dsw") {
        const issuesAssignedToDsw = await IssueRegModel.find({
          forwardedTo: "dsw",
        }).sort({
          IssueForwardedAtToDsw: -1,
        });

        res.status(200).json({
          success: true,
          issuesAssignedToDsw,
        });

        // for superadmin (vyatha team)
      } else if (user.role === "superadmin") {
        const AllRegissues = await IssueRegModel.find({}).sort({
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
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  fetchIssues,
};
