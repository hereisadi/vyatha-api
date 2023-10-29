const mongoose = require("mongoose");
// const uniqueID = require("../../models/issues/issue")

const NotificationSchema = new mongoose.Schema({
  // id:uniqueID,
  dsw: [
    {
      id: String,
      time: String,
      message: String,
      isRead: Boolean,
      issueTitle: String,
      hostel: String,
    },
  ],
  warden: [
    {
      id: String,
      time: String,
      message: String,
      isRead: Boolean,
      issueTitle: String,
      hostel: String,
    },
  ],
  supervisor: [
    {
      id: String,
      time: String,
      message: String,
      isRead: Boolean,
      issueTitle: String,
      hostel: String,
    },
  ],
  student: [
    {
      id: String,
      time: String,
      message: String,
      isRead: Boolean,
      issueTitle: String,
      hostel: String,
      email: String,
    },
  ],
});

const NotificationModel = mongoose.model("Notification", NotificationSchema);
module.exports = {
  NotificationModel,
};
