const mongoose = require("mongoose");
// const moment = require("moment-timezone");

const IssueRegSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
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
  hostel: {
    required: true,
    type: String,
  },
  forwardedTo: {
    type: String,
    default: "supervisor",
  },
  IssueCreatedAt: {
    type: String,
  },
  IssueEditedAt: {
    type: String,
  },
  IssueForwardedAtToSupervisor: {
    type: String,
  },
  IssueForwardedAtToWarden: {
    type: String,
  },
  IssueForwardedAtToDsw: {
    type: String,
  },
  isSolved: {
    // only supervisor can mark an issue as solved
    type: String,
    default: "false",
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
