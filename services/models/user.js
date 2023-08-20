import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
  },
  scholarId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  idCard: {
    type: String, // This could be the path to the uploaded image file in your server
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hostelNo: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
