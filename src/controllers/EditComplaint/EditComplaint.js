const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");

// after the issue has been edited, there is no need to send the notifications to supervisor, or warden, or dsw. There should be just one label, that the issue has been edited at this time

// PUT
// access: private
// role = student
// payload : description, category, title, issueID, photo
// apiendpoint: /editissue
// desc: edit the complaint

const editComplaint = (req, res) => {
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

      if (user.role === "student") {
        const { photo } = req.body;
        let { description, category, title, issueID } = req.body;

        if (!description && !photo && !category && !title) {
          return res.status(401).json({
            error: "Please edit atleast one filled",
          });
        }
        if (!issueID) {
          return res.status(400).json({ error: "issueID missing" });
        }
        description = description?.toString().trim();
        category = category?.toString().trim();
        title = title?.toString().trim();
        issueID = issueID?.toString().trim();

        const issue = await IssueRegModel.findById(issueID);
        if (!issue) {
          return res.status(404).json({ error: "Issue not found" });
        }

        if (issue.email !== user.email) {
          return res
            .status(401)
            .json({ error: "Not authorized to edit this issue" });
        }

        if (issue.isClosed === true) {
          return res.status(401).json({ error: "Issue is closed, can't edit" });
        }

        if (issue.isSolved === true) {
          return res.status(401).json({ error: "Issue is solved, can't edit" });
        }

        if (
          title === user.title &&
          description === user.description &&
          category === user.category &&
          photo === user.photo
        ) {
          return res.status(400).json({ error: "no changes made" });
        }

        if (description !== user.description) {
          issue.description = description;
        }

        if (category !== user.category) {
          issue.category = category;
        }

        if (title !== user.title) {
          issue.title = title;
        }

        if (photo !== user.photo) {
          issue.photo = photo;
        }

        const currentTime = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");
        if (issue.isIssueEdited === false) {
          issue.isIssueEdited = true;
        }

        issue.raiseComplainTo.push({
          editedAt: currentTime,
        });
        await issue.save();
        return res.status(200).json({ message: "Issue updated successfully" });
      } else {
        return res.status(401).json({ error: "Not authorized" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });
};

module.exports = {
  editComplaint,
};
