import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller';
import { rateLimit } from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many login attemps, please try again later"},
    standardHeaders: true,
    legacyHeaders: false,
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many refresh attemps, please try again later"},
    standardHeaders: true,
    legacyHeaders: false,
})

const router = Router();

router.post('/register', register, loginLimiter);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);

export default router;