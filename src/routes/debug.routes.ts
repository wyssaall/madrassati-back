import express from "express";
import { checkDataStructure, migrateWissalData } from "../controllers/debug.controller.js";

const router = express.Router();

/**
 * GET /api/debug/check-data
 * Check the data structure to understand User-Student relationships
 */
router.get('/check-data', checkDataStructure);

/**
 * GET /api/debug/migrate-wissal
 * Migrate Wissal's old data to link to correct student document
 */
router.get('/migrate-wissal', migrateWissalData);

export default router;
