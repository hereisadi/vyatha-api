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
const {
  fetchClosedIssue,
} = require("../controllers/FetchIssue/fetchclosedissue");
const { closeIssue } = require("../controllers/CloseIssue/Closeissue");
const {
  fetchIssueHostelWise,
} = require("../controllers/FetchIssue/superadmin/FetchAllIssueHostelWise");
const {
  FetchAllClosedIssueHostelWise,
} = require("../controllers/FetchIssue/superadmin/AllClosedHostelWise");
const { addComment } = require("../controllers/comments/addcomment");
const { getComments } = require("../controllers/comments/getComments");
const { editComment } = require("../controllers/comments/editComments");
const { approveIssue } = require("../controllers/approveIssue/ApproveIssue");

// get
router.get("/", home.home); // tested
router.get("/fetchissues", fetchIssues);
router.get("/detailedview/:issueId", detailedViewOfIssue);
router.get("/getallaccounts", getAllAccounts);
router.get("/fetchclosedissue", fetchClosedIssue);
router.get("/getcomment/:issueID", getComments);

// post
router.post("/createissue", issueReg); //tested
router.post("/signup", signup); //tested
router.post("/login", login); // tested
// router.post("/detailedview", detailedViewOfIssue);
router.post("/fetchissuehostelwise", fetchIssueHostelWise);
router.post("/fetchallclosedissuehostelwise", FetchAllClosedIssueHostelWise);
router.post("/addcomment/:issueID", addComment);

// put
router.put("/forwardissue", forwardIssue);
router.put("/issuesolved", markedAsSolved);
router.put("/demoterole", demoteRole); //tested
router.put("/promotetodsw", roleToDsw); //tested
router.put("/promotetosupervisor", roleToSupervisor); //tested
router.put("/promotetowarden", roleToWarden); //tested
router.put("/editprofile", editPrfoile);
router.put("/closeissue", closeIssue);
router.put("/editcomment/:issueID/:commentID", editComment);
router.put("/approveissue", approveIssue);

//delete
router.delete("/deleteaccount", deleteAccount);
module.exports = router;
