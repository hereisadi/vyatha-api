const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

// GET detailed view of issue
// payload: issueId
// role: student, supervisor, warden, dsw, superadmin
// access: private
// endpoint: /detailedview

// this might be converted to GET /detailedview/:issueId for ease of client team to send issueId as params

// UPD:26 oct 2023: converted to GET /detailedview/:issueId

const detailedViewOfIssue = async (req, res) => {
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

      // student's stuff
      if (user.role === "student") {
        const { issueId } = req.params; // client should send issueId as params
        if (!issueId) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        if (issue.email !== user.email) {
          return res.status(401).json({
            success: false,
            error: "Not authorized to access this issue's details",
          });
        } else {
          res.status(200).json({ success: true, issue });
        }

        // supervisor's stuff
      } else if (user.role === "supervisor") {
        const { issueId } = req.params; // client should send issueId as params
        if (!issueId) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        if (
          // issue.forwardedTo === "supervisor" &&
          issue.hostel === user.hostel
        ) {
          res.status(200).json({
            success: true,
            issue,
          });
        } else {
          return res.status(401).json({
            success: false,
            error: "Not authorized to access this issue's details",
          });
        }

        // warden's stuff
      } else if (user.role === "warden") {
        const { issueId } = req.params; // client should send issueId as params
        if (!issueId) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        if (issue.forwardedTo === "warden" && issue.hostel === user.hostel) {
          res.status(200).json({
            success: true,
            issue,
          });
        } else {
          return res.status(401).json({
            success: false,
            error: "Not authorized to access this issue's details",
          });
        }
      }

      // DSW's stuff
      else if (user.role === "dsw") {
        const { issueId } = req.params; // client should send issueId as params
        if (!issueId) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        if (issue.forwardedTo === "dsw" && issue.hostel === user.hostel) {
          res.status(200).json({
            success: true,
            issue,
          });
        } else {
          return res.status(401).json({
            success: false,
            error: "Not authorized to access this issue's details",
          });
        }

        // superadmin's stuff
      } else if (user.role === "superadmin") {
        const { issueId } = req.params; // client should send issueId as params
        if (!issueId) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        const issue = await IssueRegModel.findById(issueId);
        if (!issue) {
          return res.status(401).json({ error: "No such issue exists" });
        }

        res.status(200).json({
          success: true,
          issue,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "No such role exists",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong",
      });
    }
  });
};

module.exports = {
  detailedViewOfIssue,
};
