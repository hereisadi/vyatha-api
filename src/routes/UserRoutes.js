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

// get
router.get("/", home.home);
router.get("/fetchissues", fetchIssues);
router.get("/getallaccounts", getAllAccounts);

// post
router.post("/createissue", issueReg);
router.post("/signup", signup);
router.post("/login", login);

// put
router.put("/forwardissue", forwardIssue);
router.put("/issuesolved", markedAsSolved);
router.put("/demoterole", demoteRole);
router.put("/promotetodsw", roleToDsw);
router.put("/promotetosupervisor", roleToSupervisor);
router.put("/promotetowarden", roleToWarden);

//delete
router.delete("/deleteaccount", deleteAccount);
module.exports = router;
