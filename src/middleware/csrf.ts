import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function issueCsrfToken(req: Request, res: Response, next: NextFunction){
    if (!req.cookies?.csrfToken) {
        const token = crypto.randomBytes(32).toString("hex");
        res.cookie("csrfToken", token, {
            httpOnly: false,
            sameSite: "strict",
            secure: true,
        })
    }
    next();
}

export function verifyCsrfToken(req: Request, res: Response, next: NextFunction){
    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.headers["x-csrf-token"]; //from frontend

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({error: "CSRF token was invalid or missing"});
    }
    next();
}

