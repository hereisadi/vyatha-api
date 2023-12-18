const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");
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
        // user.role === "supervisor" ||
        // user.role === "warden" ||
        // user.role === "dsw" ||

        // in the below logic if an issue has been forwarded to warden, then supervisor can't add comment
        (user.role === issue.forwardedTo && user.hostel === issue.hostel) || // for those who have been assigned the issue
        user.role === "superadmin"

        // user.role==="student" || issue.
      ) {
        const { commentBody } = req.body; // client should send commentBody as payload

        if (!issue) {
          return res.status(401).json({
            error: "No such issue exists",
          });
        }

        const newComment = {
          author: user.name,
          authorpic: user.profilepic,
          commentBody,
          createdAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
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
