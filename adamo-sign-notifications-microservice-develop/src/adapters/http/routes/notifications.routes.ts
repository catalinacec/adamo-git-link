// src/adapters/http/routes/notifications.routes.ts
import { Router } from "express";
import { notificationsController } from "../controllers/notifications.controller";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";

const router = Router();

router.post(
  "/health",
  authenticateToken,
  asyncHandler(notificationsController.health)
);

router.get("/", authenticateToken, asyncHandler(notificationsController.list));
router.post(
  "/",
  authenticateToken,
  asyncHandler(notificationsController.create)
);
router.patch(
  "/:id/read",
  authenticateToken,
  asyncHandler(notificationsController.markRead)
);
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(notificationsController.delete)
);

router.get(
  "/unread-count",
  authenticateToken,
  asyncHandler(notificationsController.countUnread)
);

export default router;
