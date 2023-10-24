const mongoose = require("mongoose");

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
    type: String,
    default: "false",
  },
  solvedAt: {
    type: String,
  },
});

const IssueRegModel = mongoose.model("IssueReg", IssueRegSchema);

module.exports = {
  IssueRegModel,
};
