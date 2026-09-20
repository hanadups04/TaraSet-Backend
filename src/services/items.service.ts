import { pool } from '../config/db';

export async function getAllCircles() {
    const result = await pool.query('SELECT * FROM circles_tbl ORDER BY created_at');
    return result.rows
}

export async function createItem(name: string) {
    const result = await pool.query(
        'INSERT INTO items (name) VALUES ($1) RETURNING *',
        [name]
    );
    return result.rows[0];
}