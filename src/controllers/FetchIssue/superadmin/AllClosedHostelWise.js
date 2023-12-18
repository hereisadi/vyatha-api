const { verifyToken } = require("../../../middlewares/VerifyToken");
const { SignUpModel } = require("../../../models/Localauth/Signup");
const { IssueRegModel } = require("../../../models/issues/issue");

// POST to fetch all the issues hostel wise for SUPERADMIN only
// role: superadmin
// access: private
// endpoint: /fetchallclosedissuehostelwise
// payload: hostel

const FetchAllClosedIssueHostelWise = (req, res) => {
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

      if (user.role === "superadmin") {
        const { hostel } = req.body; // client should send hostel as payload

        const allHostelSpecificIssues = await IssueRegModel.find({
          hostel: hostel,
          isClosed: true,
        }).sort({
          IssueCreatedAt: +1, // sort from newest to oldest; +1 for oldest to newest
        });
        res.status(200).json({
          success: true,
          allHostelSpecificIssues,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Not authorized to access this api endpoint",
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
  FetchAllClosedIssueHostelWise,
};
