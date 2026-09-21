import { pool } from "../config/db"

export async function getAllCirclesServices(user_id: string) {
    const result = await pool.query(
       `SELECT 
            c.circle_id,
            c.circle_name,
            c.circle_code,
            c.total_members,
            c.owner_id,
            c.created_at,
            u.username 
        FROM circles_tbl c
        INNER JOIN user_tbl u
            ON c.owner_id = u.id
        WHERE c.owner_id = $1`, 
        [user_id],
    );
    return result.rows;
}

export async function getACircleServices(circle_id: string) {
    const result = await pool.query(
       `SELECT
            c.circle_id,
            c.circle_name,
            c.circle_code,
            c.total_members,
            c.owner_id,
            c.created_at,
        COALESCE(children.items, '[]'::jsonb) AS tbl2cmtbl,
        COALESCE(children2.items, '[]'::jsonb) AS tbl3cdtbl
        FROM circles_tbl c
        INNER JOIN LATERAL (
            SELECT jsonb_agg(
                to_jsonb(tbl2cmtbl)
                || jsonb_build_object(
                    'tbl4utbl', jsonb_build_object('username', tbl4utbl.username)
                )
            ) AS items
            FROM circle_members_tbl tbl2cmtbl
            INNER JOIN user_tbl tbl4utbl
                ON tbl2cmtbl.user_id = tbl4utbl.id
            WHERE tbl2cmtbl.circle_id = c.circle_id
        ) AS children ON true

        INNER JOIN LATERAL (
            SELECT jsonb_agg(
                to_jsonb(tbl3cdtbl)
                || jsonb_build_object(
                    'tbl4utbl', jsonb_build_object('username', tbl4utbl.username)
                )
            ) AS items
            FROM circle_dates_tbl tbl3cdtbl
            INNER JOIN user_tbl tbl4utbl
                ON tbl3cdtbl.user_id = tbl4utbl.id
            WHERE tbl3cdtbl.circle_id = c.circle_id
        ) AS children2 ON true

        WHERE c.circle_id = $1`,
        [circle_id], 
    );
    return result.rows;
}


