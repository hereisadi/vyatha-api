const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const moment = require("moment-timezone");
const { IssueRegModel } = require("../../models/issues/issue");

// access: private
// endpoint: /raiseComplain
// payload: issueID
// role: student
// desc: raise complain to  warden and dsw

const raiseComplain = async (req, res) => {
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
        let issueID = req.body;
        if (!issueID) {
          return res.status(400).json({ error: "Please provide issue ID" });
        }
        issueID = issueID?.toString().trim();
        const issue = await IssueRegModel.findById(issueID);
        if (!issue) {
          return res.status(401).json({ error: "No such issue exists" });
        }
        if (issue.email !== user.email) {
          return res.status(401).json({
            error: "Not authorized to access this issue",
          });
        }

        const currentTime = moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma");

        //supervisor by default
        const firstComplainTime = issue?.raiseComplainTo[0]?.when;
        const firstComplainRaisedTo = issue?.raiseComplainTo[0]?.whom;

        // warden
        const SecondComplainTime = issue?.raiseComplainTo[1]?.when;
        const SecondComplainRaisedTo = issue?.raiseComplainTo[1]?.whom;

        // if difference between issueCreatedAt and currentTime is more than 7 days, then student can  raise complain to warden

        // if(issue.raiseComplainTo.length === 1){
        //   return res.status(200).json({message:"Complain raised to supervisor"})
        // }

        // if(issue.raiseComplainTo.length === 2){
        //   return res.status(200).json({message:"Complain raised to warden"})
        // }

        // if(issue.raiseComplainTo.length === 3){
        //   return res.status(200).json({message:"Complain raised to dsw"})
        // }

        if (
          issue.raiseComplainTo.length === 1 &&
          firstComplainRaisedTo === "supervisor"
        ) {
          if (
            moment(currentTime, "DD-MM-YY h:mma").diff(
              moment(firstComplainTime, "DD-MM-YY h:mma"),
              "days"
            ) > 7
          ) {
            issue.raiseComplainTo.push({
              whom: "warden",
              when: currentTime,
            });
            issue.save();
            return res
              .status(200)
              .json({ success: true, message: "Complain raised to warden" });
          } else {
            return res
              .status(401)
              .json({ error: "Can't raise complain to warden before 7 days" });
          }
        } else if (
          issue.raiseComplainTo.length === 2 &&
          SecondComplainRaisedTo === "warden" &&
          moment(currentTime, "DD-MM-YY h:mma").diff(
            moment(SecondComplainTime, "DD-MM-YY h:mma"),
            "days"
          ) > 7
        ) {
          issue.raiseComplainTo.push({
            whom: "dsw",
            when: currentTime,
          });
          issue.save();
          return res
            .status(200)
            .json({ success: true, message: "Complain raised to dsw" });
        } else if (issue.raiseComplainTo.length === 3) {
          return res
            .status(401)
            .json({ error: "Complain already raised to dsw" });
        } else {
          return res.status(400).json({ error: "unavailable operation" });
        }
      } else {
        return res
          .status(401)
          .json({ error: "not authorized to access this endpoint" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

module.exports = {
  raiseComplain,
};
