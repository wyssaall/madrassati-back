import express from "express";
import { insertDemoData } from "../controllers/test.controller.js";

const router = express.Router();

/**
 * GET /api/test/insert
 * Insert demo data into all collections for testing MongoDB connection
 */
router.get('/insert', insertDemoData);

export default router;


