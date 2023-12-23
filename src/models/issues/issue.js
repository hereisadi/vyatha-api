const mongoose = require("mongoose");
const moment = require("moment-timezone");
// const uniqueID = require("../../utils/uniqueid")

const IssueRegSchema = new mongoose.Schema({
  otherID: String,
  name: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  scholarID: {
    required: true,
    type: String,
  },
  title: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  photo: {
    required: true,
    type: String,
  },
  category: {
    required: true,
    type: String,
  },
  hostel: {
    required: true,
    type: String,
  },
  room: {
    required: true,
    type: String,
  },
  forwardedTo: {
    type: String,
    default: "supervisor",
  },
  // student can raise their complain to the warden after 7 days of raising the issue, if there is no response from the supervisor's side, before 7 days, the student can't raise their complain to the warden and so on
  raiseComplainTo: [
    {
      whom: {
        type: String,
        default: "supervisor",
      },
      when: {
        type: String,
        default: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
      },
    },
  ],
  IssueCreatedAt: {
    type: String,
  },
  IssueEditedAt: {
    type: String,
  },
  IssueForwardedAtToSupervisor: {
    type: String,
  },
  IssueForwardedToWarden: [
    {
      time: String,
      reasonForForwarding: String,
      isApproved: {
        type: Boolean,
        default: false,
      },
    },
  ],
  IssueForwardedToDsw: [
    {
      time: String,
      reasonForForwarding: String,
      isApproved: {
        type: Boolean,
        default: false,
      },
    },
  ],
  isSolved: {
    // only supervisor can mark an issue as solved
    type: Boolean,
    default: false,
  },
  solvedAt: {
    type: String,
  },
  isClosed: {
    // only student can change to true
    type: Boolean,
    default: false,
  },
  comments: [
    {
      commentId: String,
      author: String,
      authorpic: String,
      authoremail: String,
      commentBody: String,
      createdAt: String,
      editedAt: String,
    },
  ],
});

const IssueRegModel = mongoose.model("IssueReg", IssueRegSchema);

module.exports = {
  IssueRegModel,
};
