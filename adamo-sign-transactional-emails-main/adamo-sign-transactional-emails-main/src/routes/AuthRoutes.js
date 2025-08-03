import { Router } from "express";

import {
    register,
    login,
    changePassword,
    resetPassword,
    setNewPassword
} from '../controllers/AuthController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/set-new-password', setNewPassword);
router.patch('/change-password', changePassword);

export default router;