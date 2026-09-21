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
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "strict" , secure: process.env.NODE_ENV === "production" });
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



// [
//     {
//         "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//         "user_id": "f2dcbc0e-f2ed-413d-b4a7-cad26fc469ac",
//         "created_at": "2026-07-27T08:24:24.444Z",
//         "overall_cohesion_score": "0%",
//         "tbl2": [
//             {
//                 "tbl5": {
//                     "concept_name": "Problem"
//                 },
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 1,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "extracted_content": "Student publications such as The Nuntium rely heavily on social media (Facebook) and fragmented, unintegrated tools for article creation and task management. This leads to workflow confusion, delayed updates, lack of structured editorial oversight, poor content preservation, and susceptibility to misinformation due to unverified publishing.",
//                 "extracted_concept_id": "1f08a81e-1a44-460c-8b08-33c61e65f6d6"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Methodology"
//                 },
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 2,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "extracted_content": "The study utilized a Modified Waterfall Methodology comprising Requirements Analysis, System Design, Development, Testing and Evaluation, and Implementation/Maintenance. It integrated an Input-Process-Output (IPO) framework, system modelling (DFDs, Use Cases, HIPO, ERD), functionality, unit, and cross-platform compatibility testing, and purposive sampling of 30 participants (10 IT Experts, 10 Subject Matter Experts, 10 End Users) to evaluate the web application via ISO 25010 and the mobile application via MARS.",
//                 "extracted_concept_id": "374b73e8-b2e4-4c55-97f6-eb6cec21a3ac"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Solution"
//                 },
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 3,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "extracted_content": "The solution is 'Editorially', a centralized web application adapted as a Progressive Web App (PWA) for mobile devices. It features three main modules: the Publication Site (for reader consumption of verified articles), Content Pipeline Module (structured collaborative workflow for article proposals, task assignment, drafting, and editorial board review/approval), and Article Management Module (post-publication editing, archiving, featuring, and searching), built using React.js, Supabase, and Firebase with Role-Based Access Control (RBAC).",
//                 "extracted_concept_id": "86192bba-0fe9-4f6a-8258-3da7c642746f"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Literature"
//                 },
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 4,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "extracted_content": "The literature reviews digital journalism credibility, challenges faced by student publications, the strategic role of Content Management Systems (CMS) and Project Management Systems (PMS) in streamlining newsroom workflows, and the impact of visual design/UX aesthetics on perceived news trust and credibility.",
//                 "extracted_concept_id": "77be1799-457c-44f5-bff4-383ae34e1771"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Result"
//                 },
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 5,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "extracted_content": "Editorially successfully passed all functionality, unit, and compatibility tests. Evaluation using ISO 25010 for the web application yielded an overall mean score of 4.49 (SD = 0.61), interpreted as 'Excellent'. Evaluation of the mobile application using MARS yielded an overall mean score of 3.61 (SD = 0.50), interpreted as 'Highly Acceptable'.",
//                 "extracted_concept_id": "e63080f6-af97-4e2f-953a-302d6bab0c16"
//             }
//         ],
//         "tbl3": [
//             {
//                 "tbl5": {
//                     "concept_name": "Problem"
//                 },
//                 "reason": "The problem of fragmented workflows and unverified publishing in student journalism is clearly articulated and directly matched by the system's objectives, architecture, and evaluation.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 1,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "cohesion_id": "f3e8b102-9b91-430e-aec3-aa0ff3a5ea7b",
//                 "cohesion_score": "Cohesive"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Methodology"
//                 },
//                 "reason": "The development and testing methodologies are comprehensively explained and systematically link the requirements phase to the final implementation and evaluation.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 2,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "cohesion_id": "c964090c-1927-49d1-b8be-711e3c1d6a29",
//                 "cohesion_score": "Cohesive"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Solution"
//                 },
//                 "reason": "The solution (Editorially) provides detailed technical descriptions and visual prototypes of features that directly resolve each specific issue stated in the problem section.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 3,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "cohesion_id": "2bd5f000-5874-4dac-82a4-f1693b3df44a",
//                 "cohesion_score": "Cohesive"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Literature"
//                 },
//                 "reason": "The literature review strongly supports the necessity of CMS platforms, structured oversight, and visual aesthetic standards in digital student journalism.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 4,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "cohesion_id": "8a655ac7-1397-44f5-82c5-68ea5940b920",
//                 "cohesion_score": "Cohesive"
//             },
//             {
//                 "tbl5": {
//                     "concept_name": "Result"
//                 },
//                 "reason": "The results provide thorough empirical data from unit/compatibility testing and ISO 25010/MARS evaluations, fully answering the research objectives.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "concept_id": 5,
//                 "created_at": "2026-07-27T16:24:42.578317",
//                 "cohesion_id": "27a7f881-ace4-421a-a60f-05a2e618eb1b",
//                 "cohesion_score": "Cohesive"
//             }
//         ],
//         "tbl4": [
//             {
//                 "kind": 1,
//                 "crs_id": "948a98bd-c583-4026-b833-3f781ff9d8f5",
//                 "reason": "The identified problem of fragmented workflows and weak editorial oversight directly determined the system development methodology, including requirement gathering from student publication leaders and structured testing frameworks.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "strength": 9,
//                 "created_at": "2026-07-27T16:24:42.578317+00:00",
//                 "to_concept": 2,
//                 "updated_at": null,
//                 "from_concept": 1,
//                 "to_concept_ref": {
//                     "concept_name": "Methodology"
//                 },
//                 "from_concept_ref": {
//                     "concept_name": "Problem"
//                 }
//             },
//             {
//                 "kind": 1,
//                 "crs_id": "1ddc7a4a-5978-40ee-a213-57a73d5f77bb",
//                 "reason": "The developed modules and features of Editorially were tested and evaluated by users, directly producing the quantitative evaluation scores and feedback reported in the results.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "strength": 9,
//                 "created_at": "2026-07-27T16:24:42.578317+00:00",
//                 "to_concept": 5,
//                 "updated_at": null,
//                 "from_concept": 3,
//                 "to_concept_ref": {
//                     "concept_name": "Result"
//                 },
//                 "from_concept_ref": {
//                     "concept_name": "Solution"
//                 }
//             },
//             {
//                 "kind": 1,
//                 "crs_id": "70988f6d-cb7b-4974-9416-305adb308238",
//                 "reason": "The high evaluation scores and successful test results directly demonstrate that the implemented solution effectively addresses the initial problem of workflow fragmentation and weak editorial verification.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "strength": 9,
//                 "created_at": "2026-07-27T16:24:42.578317+00:00",
//                 "to_concept": 5,
//                 "updated_at": null,
//                 "from_concept": 1,
//                 "to_concept_ref": {
//                     "concept_name": "Result"
//                 },
//                 "from_concept_ref": {
//                     "concept_name": "Problem"
//                 }
//             },
//             {
//                 "kind": 1,
//                 "crs_id": "1e05924b-55e8-4ac9-b107-9a654abfacf1",
//                 "reason": "The literature on CMS and PMS design and UX credibility informed the selection of the evaluation criteria, standard evaluation metrics (ISO 25010 and MARS), and target user sampling methods.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "strength": 9,
//                 "created_at": "2026-07-27T16:24:42.578317+00:00",
//                 "to_concept": 2,
//                 "updated_at": null,
//                 "from_concept": 4,
//                 "to_concept_ref": {
//                     "concept_name": "Methodology"
//                 },
//                 "from_concept_ref": {
//                     "concept_name": "Literature"
//                 }
//             },
//             {
//                 "kind": 2,
//                 "crs_id": "4c1a7a76-cb28-4186-8def-e505f873b4e2",
//                 "reason": "The Waterfall methodology, software architecture designs (DFDs, database schema), and selected technology stack (React.js, Supabase, PWA) directly produced the functional modules of the Editorially system.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "strength": 10,
//                 "created_at": "2026-07-27T16:24:42.578317+00:00",
//                 "to_concept": 3,
//                 "updated_at": null,
//                 "from_concept": 2,
//                 "to_concept_ref": {
//                     "concept_name": "Solution"
//                 },
//                 "from_concept_ref": {
//                     "concept_name": "Methodology"
//                 }
//             },
//             {
//                 "kind": 2,
//                 "crs_id": "fb9fe6a3-9b90-4de2-a6b9-1f54e94ba1b7",
//                 "reason": "Prior research on CMS workflows, role permissions, and visual presentation directly guided the core module architecture and UI design of Editorially.",
//                 "paper_id": "57cfd510-9e0e-4cf1-b10a-ae79623a840b",
//                 "strength": 9,
//                 "created_at": "2026-07-27T16:24:42.578317+00:00",
//                 "to_concept": 3,
//                 "updated_at": null,
//                 "from_concept": 4,
//                 "to_concept_ref": {
//                     "concept_name": "Solution"
//                 },
//                 "from_concept_ref": {
//                     "concept_name": "Literature"
//                 }
//             }
//         ]
//     }
// ]