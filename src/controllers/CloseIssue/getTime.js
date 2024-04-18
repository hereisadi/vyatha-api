const { customSort } = require("../../lib/CustomSort");
const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

const getTime = (req, res) => {
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

      const allIssues = await IssueRegModel.find({ email: user.email });
      const allClosedIssuesUnsorted = allIssues.filter(
        (issue) => issue.isClosed === true && issue.closedBy === "supervisor"
      );
      const closedIssueTime = allClosedIssuesUnsorted.map(
        (issue) => issue.closedAt
      );
      const sortedClosedIssueTime = customSort(closedIssueTime, -1);
      const allClosedTimeSorted = sortedClosedIssueTime.map((time) =>
        allClosedIssuesUnsorted.find((issue) => issue.closedAt === time)
      );
      const closedIssueTimeArray = [];
      for (let i = 0; i < allClosedTimeSorted.length; i += 3) {
        closedIssueTimeArray.push(allClosedTimeSorted.slice(i, i + 3));
      }

      return res.status(200).json({ closedIssueTimeArray });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

module.exports = {
  getTime,
};
