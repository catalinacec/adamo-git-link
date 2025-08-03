import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics
 */
router.post(`/health`, asyncHandler(AnalyticsController.health));

export default router;
