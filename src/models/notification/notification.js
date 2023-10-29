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
