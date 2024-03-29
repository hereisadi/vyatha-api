const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
// const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");

// POST to add comment
// role: all
// access: private
// endpoint: /addcomment
// payload: issueID as params and commentBody as body (req.body)

const addComment = async (req, res) => {
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

      const { issueID } = req.params; // client should send issueID as params

      const issue = await IssueRegModel.findById(issueID);

      // to_do: only that role can add comment which is allowed to view that issue

      if (
        user.email === issue.email || // for student who created the issue
        // in the below logic if an issue has been forwarded to warden, then supervisor can't add comment
        (user.role === issue.forwardedTo && user.hostel === issue.hostel) || // for those who have been assigned the issue
        user.role === "superadmin" || // vyatha team
        (issue.forwardedTo === "warden" && user.role === "supervisor") ||
        (issue.forwardedTo === "dsw" &&
          (user.role === "supervisor" || user.role === "warden"))
        // user.role==="student" || issue.
      ) {
        const { commentBody, createdAt } = req.body; // client should send commentBody as payload

        if (!issue) {
          return res.status(401).json({
            error: "No such issue exists",
          });
        }

        if (issue.isClosed === true) {
          return res.status(401).json({
            error: "Issue has been closed by the student, can't add comment",
          });
        }

        if (issue.isSolved === true) {
          return res.status(401).json({
            error: "Issue has been solved, can't add comment",
          });
        }

        if (!commentBody) {
          return res.status(401).json({
            error: "No comment body found",
          });
        }

        const newComment = {
          author: user.name,
          authorpic: user.profilepic,
          commentBody,
          createdAt: createdAt,
          authoremail: user.email,
          commentId: uuidv4(),
        };

        issue.comments.push(newComment);
        await issue.save();
        res.status(200).json({ message: "comment added successfully" });
      } else {
        return res
          .status(401)
          .json({ error: "no such role exists which can add comment" });
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
  addComment,
};
