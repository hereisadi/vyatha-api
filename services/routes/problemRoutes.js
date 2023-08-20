import express from "express";
import {
  createProblem,
  updateProblem,
  getProblemsByUser,
  getProblemsByAssignedTo,
} from "../controllers/problemController.js";

const router = express.Router();

router.post("/", createProblem);
router.put("/:problemId", updateProblem);
router.get("/user/:scholarId", getProblemsByUser);
router.get("/assignedTo/:assignedTo", getProblemsByAssignedTo);

export { router as problemRoutes };
