import { poolPromisePostGreSQL } from '../../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';
import {  formatDateIgnoringUTC } from '../../config/util.js';


   export const GetShowsNotAssiciatedInvoicePostgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { CustomerID } = req.query;

    if (!CustomerID || CustomerID.toString().length === 0) {
       res.status(404).json({ message: "No CustomerID supplied" });
    }

    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
      SELECT *
      FROM shows
      WHERE showid NOT IN (
        SELECT S.showid
        FROM shows S
        INNER JOIN invoice I ON S.showid = I.showid
        WHERE I.customerid = $1
      )
      AND customerid = $1
    `;

    const result = await pool.query(query, [CustomerID]);
    const showsSrc: IRawShowPostgress[] = result.rows;

    const finalResult: IShowDTO[] = showsSrc.map(show => ({
      showID: show.showid,
      numberOfPeople: show.numberofpeople,
      programID: show.programid,
      price: show.price, // If it's a string (numeric), parse to float
      notes: show.notes,
      customerID: show.customerid,
      datePerformance: formatDateIgnoringUTC(new Date(show.dateperformance)),
    }));

    res.json(finalResult);

  } catch (err) {
    console.error(`❌ Error fetching shows not associated with invoice`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


  export default GetShowsNotAssiciatedInvoicePostgress;