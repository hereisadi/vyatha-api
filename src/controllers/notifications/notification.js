const verifyToken = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");

// GET notifications
// access: private
// role : all
// endpoint: /notifications

const notification = async (req, res) => {
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

      // notification logic here
      if (user.role === "student") {
        //
      } else if (user.role === "supervisor") {
        //
      } else if (user.role === "warden") {
        // when IssueForwardedToWarden this property changes in the IssueRegModel model, then the warden will get a notification
        // code below:
      } else if (user.role === "dsw") {
        // when forwardedTo property changes to dsw in the IssueRegModel model, then the dsw will get a notification with the title "New issue has been forwarded to you from the warden"
      } else if (user.role === "superadmin") {
        //
      } else {
        return res.status(400).json({
          success: false,
          error: "Not authorized to fetch notifications",
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
  notification,
};
