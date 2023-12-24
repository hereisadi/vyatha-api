const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");

const getRaisedComplains = async (req, res) => {
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

      const allComplains = await IssueRegModel.find({});

      if (user.role === "student") {
        const allComplaintsRaisedAboveSupervisor = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length > 1;
          }
        );

        let allComplaints = [];
        for (let i = 0; i < allComplaintsRaisedAboveSupervisor.length; i++) {
          if (allComplaintsRaisedAboveSupervisor[i].email === user.email) {
            allComplaints.push(allComplaintsRaisedAboveSupervisor[i]);
          }
        }
        return res.status(200).json({ success: true, allComplaints });
      } else if (user.role === "supervisor") {
        const allComplaintsRaisedToSupervisor = allComplains.filter(
          (complain) => {
            return complain.raiseComplainTo.length === 1;
          }
        );

        return res.status(200).json({
          success: true,
          allComplaintsRaisedToSupervisor,
        });
      } else if (user.role === "warden") {
        const allComplaintsRaisedToWarden = allComplains.filter((complain) => {
          return complain.raiseComplainTo.length === 2;
        });

        return res.status(200).json({
          success: true,
          allComplaintsRaisedToWarden,
        });
      } else if (user.role === "dsw") {
        const allComplaintsRaisedToDsw = allComplains.filter((complain) => {
          return complain.raiseComplainTo.length === 3;
        });

        return res.status(200).json({
          success: true,
          allComplaintsRaisedToDsw,
        });
      } else {
        return res
          .status(401)
          .json({ error: "not authorized to access this api endpoint" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

module.exports = {
  getRaisedComplains,
};
