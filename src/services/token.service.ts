import jwt from 'jsonwebtoken';

export function generateTokens(user_id: string) {
  const accessToken = jwt.sign(
    { user_id },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' } // short-lived on purpose
  );
  const refreshToken = jwt.sign(
    { user_id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' } // long-lived
  );
  return { accessToken, refreshToken };
}