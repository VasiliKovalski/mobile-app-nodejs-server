import { poolPromisePostGreSQL } from '../../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';
import {  formatDateIgnoringUTC, getTimeDifference } from '../../config/util.js';

  export const GetTodayAccomodationPostgress = async (req: AuthRequest, res: Response) => {
  try {
    const timeOffset = getTimeDifference(); // returns an integer like +12, -5 etc.

    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
      SELECT 
        E.description AS "eventDescription",
        E.eventid AS "eventID",
        E.starttime AS "eventStartTime",
        E.endtime AS "eventEndTime",
        E.notes AS "eventNotes",
        H.description AS "hotelDescription",
        H.name AS "hotelName",
        H.address AS "hotelCoordinates",
        H.physicaladdress AS "hotelPhysicalAddress"
      FROM event E
      INNER JOIN hotel H ON H.hotelid = E.hotelid
      WHERE CURRENT_TIMESTAMP + INTERVAL '${timeOffset} hours' BETWEEN E.starttime AND E.endtime
      LIMIT 1;
    `;

    const result = await pool.query(query);
    const accommodation: IWebApiAccomodation | undefined = result.rows[0];

    if (accommodation) {
      accommodation.eventStartTime = formatDateIgnoringUTC(new Date(accommodation.eventStartTime ?? ""));
      accommodation.eventEndTime = formatDateIgnoringUTC(new Date(accommodation.eventEndTime ?? ""));
    }

    res.json(accommodation || {});
  } catch (err) {
    console.error(`❌ Error fetching accommodation`, err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

  export default GetTodayAccomodationPostgress;