const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

const IndividualProfile = async (req, res) => {
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
        let { _id } = req.params;
        if (!_id) {
          return res.status(404).json({ error: "missing id" });
        }
        _id = _id.trim();
        const individualProfile = await SignUpModel.findById(_id);
        if (!individualProfile) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({ success: true, individualProfile });
      } else {
        return res
          .status(401)
          .json({ success: false, error: "Not authorized to access this api" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Something went wrong" });
    }
  });
};

module.exports = {
  IndividualProfile,
};
