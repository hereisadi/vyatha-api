const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");

//PUT to edit comment
//access:private
// payload: issueID, commentID as params and commentBody as body (req.body)
// endpoint: /editcomment/:issueID/:commentID

const editComment = (req, res) => {
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
      const { commentID } = req.params; // client should send commentID as params
      const { commentBody } = req.body; // client should send commentBody as payload

      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      const commentArray = issue.comments;

      if (commentArray.some((comment) => comment.commentId === commentID)) {
        // find the corresponding authoremail of the commentID
        const thatParticularCommentItem = commentArray.find(
          (comment) => comment.commentId === commentID
        );

        if (thatParticularCommentItem.authoremail === user.email) {
          //edit the comment
          if (commentBody) {
            thatParticularCommentItem.commentBody = commentBody;
            thatParticularCommentItem.editedAt = moment
              .tz("Asia/Kolkata")
              .format("DD-MM-YY h:mma");

            await issue.save();
            res.status(200).json({
              success: true,
              message: "Comment edited successfully",
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            error: "Not authorized to edit this comment",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: "No such comment with that commentID exists",
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
  editComment,
};
