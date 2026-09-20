import jwt from 'jsonwebtoken';

export function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' } // short-lived on purpose
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' } // long-lived
  );
  return { accessToken, refreshToken };
}