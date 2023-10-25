const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

// GET to fetch comments
// role: all
// access: private
// payload: issueID as params
// endpoint: /getcomment/:issueID

// architecture: logged in user will be able to view the comments

const getComments = async (req, res) => {
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

      const { issueID } = req.params;
      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      const commentArray = issue.comments;
      return res.status(200).json({
        success: true,
        comments: commentArray,
      });

      //   if (commentArray.some((comment) => comment.authoremail === user.email)) {

      //   } else {
      //     return res.status(400).json({
      //       success: false,
      //       error: "Not authorized to fetch these comments",
      //     });
      //   }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  getComments,
};
