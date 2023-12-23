const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const { IssueRegModel } = require("../../models/issues/issue");
const moment = require("moment-timezone");
const uniqueid = require("../../utils/uniqueid");
const { NotificationModel } = require("../../models/notification/notification");
// post request

// POST issue registration
// role:  student
// access: private
// endpoint: /createissue

const issueReg = async (req, res) => {
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

      const { role, name, email, hostel, isVerified, room, scholarID } = user;

      const randomGeneratedID = uniqueid.uniqueID;
      // only student can file an issue
      if (role === "student") {
        if (isVerified === false) {
          return res.status(400).json({
            success: false,
            error: "You must verify your email to submit an issue",
          });
        } else {
          const { photo } = req.body;
          let { description, category, title } = req.body; // client should send description, photo and category as payload

          if (!description || !photo || !category || !title) {
            return res.status(401).json({
              error: "Please provide title, description and photo",
            });
          }

          description = description?.toString().trim();
          category = category?.toString().trim();
          title = title?.toString().trim();

          const issueRegistration = new IssueRegModel({
            name,
            email,
            description,
            photo,
            hostel,
            room,
            scholarID,
            IssueCreatedAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
            IssueForwardedAtToSupervisor: moment
              .tz("Asia/Kolkata")
              .format("DD-MM-YY h:mma"),
            otherID: randomGeneratedID,
            title,
            category,
          });

          await issueRegistration.save();

          const notificationReg = new NotificationModel({
            otherID: randomGeneratedID,
          });
          await notificationReg.save();

          res.status(200).json({
            success: true,
            message: "Issue registered successfully",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: "Only student can file an issue",
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
  issueReg,
};
