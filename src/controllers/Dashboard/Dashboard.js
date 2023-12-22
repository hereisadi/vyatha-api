const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

const dashboard = async (req, res) => {
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

      if (user.designation === "Student") {
        const {
          name,
          email,
          phone,
          scholarID,
          profilepic,
          hostel,
          room,
          role,
          accountCreatedAt,
          isVerified,
          deleteAccount,
        } = user;
        return res.status(200).json({
          success: true,
          user: {
            name,
            email,
            phone,
            scholarID,
            profilepic,
            hostel,
            room,
            role,
            accountCreatedAt,
            isVerified,
            deleteAccount,
          },
        });
      } else if (
        user.designation === "Warden" ||
        user.designation === "Supervisor" ||
        user.designation === "Dean"
      ) {
        const {
          name,
          email,
          phone,
          profilepic,
          hostel,
          role,
          accountCreatedAt,
          isVerified,
          deleteAccount,
        } = user;

        return res.status(200).json({
          success: true,
          user: {
            name,
            email,
            phone,
            profilepic,
            hostel,
            role,
            accountCreatedAt,
            isVerified,
            deleteAccount,
          },
        });
      }

      return res.status(200).json({ success: true, user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};

module.exports = { dashboard };
