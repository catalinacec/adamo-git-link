import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

router.get(`/public-key`, asyncHandler(AuthController.getJWKSPublicKey));

export default router;
