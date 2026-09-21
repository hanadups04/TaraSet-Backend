import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
 
  if (!token) 
    return res.status(401).json({
      error: "Not authenticated", 
      code: "NO_TOKEN" 
    });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    (req as any).userId = (payload as any).userId;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ 
        error: "Token expired", 
        code: "TOKEN_EXPIRED" 
      });
    }
    res.status(401).json({ 
      error: "Token expired", 
      code: "TOKEN_EXPIRED" 
    });
  }
}