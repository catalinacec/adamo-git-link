import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { UserController } from "../controllers/user.controller";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";
import upload from "../../../infrastructure/middlewares/upload.middleware";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User
 */
router.post(`/health`, authenticateToken, asyncHandler(UserController.health));
router.get(
  `/profile`,
  authenticateToken,
  asyncHandler(UserController.getProfile)
);
router.put(
  `/profile`,
  upload.single("profileImage"),
  authenticateToken,
  asyncHandler(UserController.updateProfile)
);

router.post(
  `/2fa/init`,
  authenticateToken,
  asyncHandler(UserController.enabledTwoFactorAuth)
);

router.post(
  `/2fa/verify`,
  authenticateToken,
  asyncHandler(UserController.verifyTwoFactorAuth)
);

router.post(
  `/2fa/disable`,
  authenticateToken,
  asyncHandler(UserController.disabledTwoFactorAuth)
);

router.post(
  `/change-password`,
  authenticateToken,
  asyncHandler(UserController.changePassword)
);

export default router;
