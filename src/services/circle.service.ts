import { pool } from "../config/db"

export async function getCirclesServiceAll(user_id: string) {
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

export async function getCircleServiceSingle(user_id: string, circle_id: string) {
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

        WHERE c.owner_id = $1 AND c.circle_id = $2`,
        [user_id, circle_id],
    );

    return result.rows[0];
}

export async function postCircleService(circle_name: string, user_id: string) {

    function generateCircleCode(length = 6): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return Array.from({ length }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");
    }

    const circle_code = generateCircleCode();
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const createCircleResult = await client.query(
            `INSERT INTO 
                circles_tbl ( circle_name, circle_code, total_members, owner_id )
            VALUES ( $1, $2, $3, $4 )
            RETURNING circle_id`,

            [circle_name, circle_code, "1", user_id]
        );

        const newCircleId =  createCircleResult.rows[0].circle_id;

        await client.query(
            `INSERT INTO
                circle_members_tbl (circle_id, user_id)
            VALUES ($1, $2)`,

            [newCircleId, user_id]
        );

        await client.query("COMMIT");

        console.log("new circle", {
            circle_id: newCircleId,
            circle_name, 
            circle_code,
            total_members: 1, 
            owner_id: user_id
        });
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function validateCodeService(circle_code: string) {
    const result = await pool.query(
        `SELECT circle_id FROM circles_tbl 
         WHERE circle_code = $1`,
         [circle_code]
    );

    return result.rows[0];
}

export async function postJoinCircleService(circle_code: string, user_id: string) {

    const circleCode = await validateCodeService(circle_code);
    const circle_id = circleCode.circle_id;
    
    const result = await pool.query(
        `INSERT INTO
            circle_members_tbl (circle_id, user_id)
        VALUES ($1, $2)`,

        [circle_id, user_id]
    );

    return result.rows[0];
}

export async function getItineraryService(circle_id: string) {

    const result = await pool.query(
        `SELECT 
            itinerary_id,
            circle_id, 
            name, 
            location,
            start_date, 
            end_date,
            notes
        FROM itinerary_tbl
        WHERE circle_id = $1`,

        [circle_id],
    );
    return result.rows;
}

export async function postDateService(circle_id: string, user_id: string, date_available: string) {
    console.log("dateee", circle_id, user_id, date_available);
    const result = await pool.query(
        `INSERT INTO 
            circle_dates_tbl (circle_id, user_id, date_available)
        VALUES ($1, $2, $3)`,

        [circle_id, user_id, date_available]
    );

    return result.rows[0];
}

export async function postItineraryService(
    circle_id: string, 
    name: string, 
    location: string, 
    start_date: string, 
    end_date: string,
    notes: string) {

    console.log("add itinerary datas", circle_id, name, location, start_date, end_date, notes);
    const result = await pool.query(
        `INSERT INTO 
            itinerary_tbl (
            circle_id, 
            name, 
            location,
            start_date,
            end_date,
            notes )
        VALUES ($1, $2, $3, $4, $5, $6)`,

        [circle_id, name, location, start_date, end_date, notes]
    );

    return result.rows[0];
}

export async function deleteCircleService(circle_id: string){
    const result = await pool.query(
        `DELETE FROM circles_tbl
        WHERE circle_id = $1`,

        [circle_id]
    );

    return result.rows[0];
}

export async function deleteItineraryService(itinerary_id:  string) {
    const result = await pool.query(
        `DELETE FROM itinerary_tbl
        WHERE itinerary_id = $1`,

        [itinerary_id]
    );
    
    return result.rows[0];
}

export async function deleteDateService(date_id: string) {
    const result = await pool.query(
        `DELETE FROM circle_dates_tbl
        WHERE circle_id = $1`,

        [date_id]
    );

    return result.rows[0];
}
// const client = await pool.connect();

//     try {
//         await client.query("BEGIN");

//         const validateCircleResult = await client.query(
//             `SELECT circle_id FROM circles_tbl 
//             WHERE circle_code = $1`,

//             [circle_code]
//         );

//         const circleId = validateCircleResult.rows[0].circle_id;

//         await client.query(
//              `INSERT INTO
//                 circle_members_tbl (circle_id, user_id)
//             VALUES ($1, $2)`,

//             [circleId, user_id]
//         );

//         await client.query("COMMIT");

//         console.log("new circle", {
//             circle_id: circleId,
//             user_id: user_id
//         });
        
//     } catch (error) {
//         await client.query("ROLLBACK");
//         throw error;
//     } finally {
//         client.release();
//     }

