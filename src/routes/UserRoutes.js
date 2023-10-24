const express = require("express");
const router = express.Router();
const home = require("../controllers/Home");
const {
  markedAsSolved,
} = require("../controllers/IssueMarkSolve/MarkedSolved");
const { fetchIssues } = require("../controllers/FetchIssue/fetchissue");
const { forwardIssue } = require("../controllers/ForwardIssue/forwardIssue");
const { issueReg } = require("../controllers/IssueSubmit/IssueReg");
const { signup } = require("../controllers/LocalAuth/Signup");
const { login } = require("../controllers/LocalAuth/Login");
const { deleteAccount } = require("../controllers/superadmin/DeleteAccount");
const { demoteRole } = require("../controllers/superadmin/DemoteRole");
const { getAllAccounts } = require("../controllers/superadmin/getAllSignup");
const { roleToDsw } = require("../controllers/superadmin/roleToDsw");
const {
  roleToSupervisor,
} = require("../controllers/superadmin/RoleToSupervisor");
const { roleToWarden } = require("../controllers/superadmin/RoleToWarden");
const { editPrfoile } = require("../controllers/LocalAuth/Editprofile");
const {
  detailedViewOfIssue,
} = require("../controllers/FetchIssue/DetailedViewOfIssue");

// get
router.get("/", home.home);
router.get("/fetchissues", fetchIssues);
router.get("/getallaccounts", getAllAccounts);

// post
router.post("/createissue", issueReg);
router.post("/signup", signup);
router.post("/login", login);
router.post("/detailedview", detailedViewOfIssue);

// put
router.put("/forwardissue", forwardIssue);
router.put("/issuesolved", markedAsSolved);
router.put("/demoterole", demoteRole);
router.put("/promotetodsw", roleToDsw);
router.put("/promotetosupervisor", roleToSupervisor);
router.put("/promotetowarden", roleToWarden);
router.put("/editprofile", editPrfoile);

//delete
router.delete("/deleteaccount", deleteAccount);
module.exports = router;
