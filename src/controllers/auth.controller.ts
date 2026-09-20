import { Request, Response } from 'express';
import { registerUser, verifyUser } from '../services/auth.service';
import { generateTokens } from '../services/token.service';
import { pool } from '../config/db';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await registerUser(email, password);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
    console.log(error);
  }
};

export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await verifyUser(email, password);

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const { accessToken, refreshToken } = generateTokens(user.id);
    await pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "strict" , secure: process.env.NODE_DEV === "production" });
    res.json({ id: user.id, email: user.email });
    console.log("token", accessToken, refreshToken);
  } catch (error) {
    res.status(500).json({ error: error });
    console.log(error);
  }
};

export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    const stored = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false',
      [oldRefreshToken]
    );
    if (stored.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token invalid or reused' });
    }

    // Rotate: kill the old one, issue a new pair
    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [oldRefreshToken]);
    const { accessToken, refreshToken } = generateTokens(payload.userId);
    await pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [payload.userId, refreshToken]);

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.json({ status: 'refreshed' });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [refreshToken]);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ status: 'logged out' });
};
