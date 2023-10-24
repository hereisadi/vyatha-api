const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const bcrypt = require("bcrypt");

// put
// PUT edit profile
// payload : name, newpwd, cnewpwd
// role : student, supervisor, warden, dsw, superadmin
// access : private
// endpoint: /editprofile

const editPrfoile = (req, res) => {
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

      const { name, newpwd, cnewpwd } = req.body;

      if (!name && !newpwd && !cnewpwd) {
        return res.status(400).json({ error: "one field must be filled" });
      }

      if (newpwd !== "" && newpwd !== cnewpwd) {
        return res.status(400).json({
          error: "new password and confirm new password must be same",
        });
      }

      const newHashedPwd = await bcrypt.hash(newpwd, 10);

      if (name) {
        user.name = name;
      }

      if (newpwd) {
        user.password = newHashedPwd;
      }

      await user.save();
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong",
      });
    }
  });
};

module.exports = {
  editPrfoile,
};
