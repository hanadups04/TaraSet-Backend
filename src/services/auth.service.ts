// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import { pool } from '../config/db';

export async function registerUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO user_tbl (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  );

  return result.rows[0];
}

export async function verifyUser(email: string, password: string) {
  const result = await pool.query('SELECT * FROM user_tbl WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}