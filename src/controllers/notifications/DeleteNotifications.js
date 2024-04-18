const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const { NotificationModel } = require("../../models/notification/notification");

// post request to delete the notification
// role: all
// payload: issueID, notificationID
// access: private
// endpoint: /deletenotification
// desc: delete notifications

const deleteNotifications = async (req, res) => {
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

      const { issueID, notificationID } = req.body;
      if (!issueID) {
        return res.status(400).json({
          success: false,
          error: "missing issueID",
        });
      }
      if (!notificationID) {
        return res.status(400).json({
          success: false,
          error: "missing notificationID",
        });
      }
      const issue = await IssueRegModel.findById(issueID);
      if (!issue) {
        return res.status(401).json({
          error: "No such issue exists",
        });
      }

      const otherID = issue.otherID;
      //   console.log(otherID);
      const notification = await NotificationModel.findOne({
        otherID: otherID,
      });
      if (!notification) {
        return res.status(401).json({
          error: "No notification exists",
        });
      }
      const Role = user.role;
      const rolesNotifications = notification[Role];

      const thatNotification = [];
      for (let i = 0; i < rolesNotifications.length; i++) {
        const id = rolesNotifications[i]._id
          .toString()
          .replace('new ObjectId("', "")
          .replace('")', "");
        if (id === notificationID) {
          thatNotification.push(rolesNotifications[i]);
          break;
        }
      }
      if (thatNotification.length === 0) {
        return res.status(401).json({
          error: "No such notification exists",
        });
      }

      // delete that notification
      const filteredNotifications = rolesNotifications.filter(
        (notification) =>
          notification._id.toString() !== thatNotification[0]._id.toString()
      );

      notification[Role] = filteredNotifications;
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
        filteredNotifications,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong on the server side",
      });
    }
  });
};

module.exports = {
  deleteNotifications,
};
