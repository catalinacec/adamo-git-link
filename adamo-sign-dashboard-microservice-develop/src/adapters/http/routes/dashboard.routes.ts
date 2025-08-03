import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";

const router = Router();

router.post(`/health`, asyncHandler(DashboardController.health));
router.get(
  `/welcome-stats`,
  authenticateToken,
  asyncHandler(DashboardController.getWelcomeStats)
);

export default router;
