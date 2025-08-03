import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization
 */
router.post(`/register`, asyncHandler(AuthController.register));
router.post(`/login`, asyncHandler(AuthController.login));
router.post(`/logout`, authenticateToken, asyncHandler(AuthController.logout));
router.post(`/forgot-password`, asyncHandler(AuthController.forgotPassword));
router.post(`/verify-otp`, asyncHandler(AuthController.verifyOtp));
router.post(`/resend-otp`, asyncHandler(AuthController.resendOtp));
router.post(`/change-password`, asyncHandler(AuthController.changePassword));
router.post(
  `/change-password-auth`,
  asyncHandler(AuthController.changePasswordWithToken)
);
router.post(
  `/accept-terms`,
  authenticateToken,
  asyncHandler(AuthController.acceptTerm)
);
router.post(`/refresh-token`, asyncHandler(AuthController.refreshToken));

export default router;
