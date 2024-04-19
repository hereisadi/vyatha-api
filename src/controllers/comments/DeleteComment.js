const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

// POST to delete comment
// access:private
// payload: issueID, commentID as params
// endpoint: /deletecomment/:issueID/:commentID
// ! DESC: delete comment api endpoint

const deleteComment = async (req, res) => {
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

      const { issueID, commentID } = req.params;
      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      const commentArray = issue.comments;

      const thatParticularCommentItem = commentArray.find(
        (comment) => comment.commentId === commentID
      );

      if (!thatParticularCommentItem) {
        return res.status(404).json({
          error: "No such comment exists",
        });
      }

      if (user.email !== thatParticularCommentItem.authoremail) {
        return res.status(401).json({
          error: "You are not authorized to delete this comment",
        });
      }

      const updatedComments = commentArray.filter(
        (comment) => comment.commentId !== commentID
      );

      issue.comments = updatedComments;
      await issue.save();
      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        updatedComments,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  deleteComment,
};
