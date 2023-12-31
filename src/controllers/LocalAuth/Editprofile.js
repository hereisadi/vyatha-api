const { verifyToken } = require("../../middlewares/VerifyToken");
const { SignUpModel } = require("../../models/Localauth/Signup");
const bcrypt = require("bcrypt");

// put
// PUT edit profile
// payload : name, newpwd, cnewpwd
// role : student, supervisor, warden, dsw, superadmin
// access : private
// endpoint: /editprofile

// student can edit their name, password, hostel number, room number and phone number, photo

const editPrfoile = (req, res) => {
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

      let { name, newpwd, cnewpwd, phone, hostel, room } = req.body;
      const { photo, idcard } = req.body;
      if (
        !name &&
        !newpwd &&
        !cnewpwd &&
        !phone &&
        !hostel &&
        !photo &&
        !idcard
      ) {
        return res
          .status(400)
          .json({ error: "atleast one field must be filled" });
      }

      name = name?.toString().trim();
      newpwd = newpwd?.toString().trim();
      cnewpwd = cnewpwd?.toString().trim();
      phone = phone?.toString().trim();
      hostel = hostel?.toString().trim();
      room = room?.toString().trim();

      if (newpwd !== "" && newpwd !== cnewpwd) {
        return res.status(400).json({
          error: "new password and confirm new password must be same",
        });
      }

      if (newpwd !== "" && newpwd.length < 8) {
        return res.status(400).json({
          error: "password must be atleast 8 characters long",
        });
      }

      const newHashedPwd = await bcrypt.hash(newpwd, 10);

      if (name === user.name) {
        return res.status(400).json({ error: "name is same as before" });
      }

      if (phone === user.phone) {
        return res
          .status(400)
          .json({ error: "phone number is same as before" });
      }

      if (user.role !== "dsw") {
        if (hostel === user.hostel) {
          return res
            .status(400)
            .json({ error: "hostel number is same as before" });
        }
      }

      if (user.role === "student") {
        if (room === user.room) {
          return res
            .status(400)
            .json({ error: "room number is same as before" });
        }
      }

      if (photo === user.profilepic) {
        return res.status(400).json({ error: "photo is same as before" });
      }

      if (user.role === "student") {
        if (idcard === user.idcard) {
          return res.status(400).json({ error: "idcard is same as before" });
        }
      }

      if (name) {
        user.name = name;
      }

      if (newpwd) {
        user.password = newHashedPwd;
      }

      if (phone) {
        user.phone = phone;
      }

      if (user.role === "student") {
        if (room) {
          user.room = room;
        }
      }

      if (user.role !== "dsw") {
        if (hostel) {
          user.hostel = hostel;
        }
      }

      if (photo) {
        user.profilepic = photo;
      }

      if (user.role === "student") {
        if (idcard) {
          user.idcard = idcard;
        }
      }

      await user.save();
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong",
      });
    }
  });
};

module.exports = {
  editPrfoile,
};
