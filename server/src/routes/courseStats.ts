import express from "express";
import { getAllCoursesStats, getCourseStats } from "../controllers/courseStats";

const router = express.Router();

// Route to get course statistics including GitHub data
router.get("/:courseId", getAllCoursesStats);

export default router;
