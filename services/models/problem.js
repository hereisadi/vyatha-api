import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  scholarId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  images: [String],
  videos: [String],
  assignedTo: {
    type: String,
    default: "Hostel Super",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "assigned", "resolved", "escalated"],
    default: "pending",
  },
  comments: [
    {
      comment: {
        type: String,
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
