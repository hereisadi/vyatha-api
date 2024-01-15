const mongoose = require("mongoose");
// const uniqueID = require("../../utils/uniqueid")

const NotificationSchema = new mongoose.Schema({
  otherID: {
    type: String,
  },
  dsw: [
    {
      id: String,
      time: String,
      message: String,
      isRead: Boolean,
      issueTitle: String,
      hostel: String,
      issueID: String,
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
      issueID: String,
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
      issueID: String,
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
      issueID: String,
    },
  ],
});

const NotificationModel = mongoose.model("Notification", NotificationSchema);
module.exports = {
  NotificationModel,
};
