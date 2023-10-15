const express = require("express");
const router = express.Router();
const home = require("../controllers/Home");

// student imports
const studentLogin = require("../controllers/LocalAuth/student/user");
const editStudentProfile = require("../controllers/LocalAuth/student/EditProfile");
const deleteAcc = require("../controllers/LocalAuth/student/DeleteAccount");
const forgotPwdStudent = require("../controllers/LocalAuth/student/ForgotPwd");

// admin imports
const adminLogin = require("../controllers/LocalAuth/admin/User");
const editAdminProfile = require("../controllers/LocalAuth/admin/EditProfile");
const deleteAccAdmin = require("../controllers/LocalAuth/admin/DeleteAccount");
const forgotPwdAdmin = require("../controllers/LocalAuth/admin/ForgotPwd");

// home endpoint
router.get("/", home.home);

// student endpoint
router.post("/student/login", studentLogin.studentLogin);
router.put("/student/edit/profile", editStudentProfile.editStudentProfile);
router.delete("/student/delete", deleteAcc.deleteAcc);
router.post("/student/forgotpwd", forgotPwdStudent.forgotPwdStudent);

// admin endpoint
router.post("/admin/login", adminLogin.adminLogin);
router.put("/admin/edit/profile", editAdminProfile.editAdminProfile);
router.delete("/admin/delete", deleteAccAdmin.deleteAccAdmin);
router.post("/admin/forgotpwd", forgotPwdAdmin.forgotPwdAdmin);

module.exports = router;
