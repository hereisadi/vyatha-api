const { verifyToken } = require("../../../middlewares/VerifyToken");
const { SignUpModel } = require("../../../models/Localauth/Signup");
const { IssueRegModel } = require("../../../models/issues/issue");

// GET to fetch all the issues hostel wise for SUPERADMIN only
// role: superadmin
// access: private
// endpoint: /fetchissuehostelwise/:hostel
// payload: hostel
// it will provide all open issues, hostel wise depending on the payload

const fetchIssueHostelWise = async (req, res) => {
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
        let { hostel } = req.params; // client should send hostel as params
        if (!hostel) {
          return res.status(400).json("hostel is missing");
        }
        hostel = hostel.trim();
        const allHostelSpecificIssues = await IssueRegModel.find({
          hostel: hostel,
          isClosed: false,
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
  fetchIssueHostelWise,
};
