import { poolPromisePostGreSQL } from '../../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';

export const GetProgramsPostgress = async (req: AuthRequest, res: Response) => {
  try {
    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
      SELECT 
        programid AS "programID",
        description,
        note,
        invoicedescription AS "invoiceDescription",
        businesstype AS "businessType"
      FROM program
    `;

    const result = await pool.query(query);
    const programs = result.rows;

    res.json(programs);

  } catch (err) {
    console.error(`❌ Error fetching programs`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


  export default GetProgramsPostgress;