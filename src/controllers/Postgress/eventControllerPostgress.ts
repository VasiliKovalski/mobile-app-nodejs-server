import { poolPromisePostGreSQL } from '../../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';
import { formatDateIgnoringUTC } from '../../config/util.js';

  async function getAdmin(eventId: number) {
    try {
        const pool = await poolPromisePostGreSQL;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
    var query = "select *, P.Name as PositionName from Administrators A  " +
                    "   inner join Calls C on A.AdminID = C.AdministratorID " +
                    " inner join Position P on P.PositionID  = A.PositionID " + 
                    " where C.CallID = $1";
      
      const result = await pool.query(query, [eventId]);
      
                    return result.rows[0] || null;
    } catch (err) {
      console.error(`❌ Error fetching admin for event ${eventId}:`, err);
    return null;
    }
  }
  
  export const getEvents = async (req: Request, res: Response) => {
  try {
    const cDate = new Date();

    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    // Replace this query with the one that matches your GETEVENTS stored procedure logic
    const query = `
      SELECT * 
      FROM events 
      WHERE start_time >= $1
    `;

    const result = await pool.query(query, [cDate]);
    const events = result.rows;

    // Populate admin field per event
    for (const event of events) {
      event.description = "HOsdfsdfPA"; // lowercase field name for Postgres
      event.admin = await getAdmin(event.callid); // ensure correct casing
    }

    res.json(events);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed", details: err });
  }
};


 

export async function getAdminsByCall(callID: number) {
  try {
    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
  SELECT 
    p.positionid, 
    c.customerid, 
    a.adminid, 
    a.name AS adminname, 
    a.phoneregular, 
    a.phonemobile, 
    p.name AS positionname
  FROM administrators a
  INNER JOIN calls c ON a.adminid = c.administratorid
  INNER JOIN position p ON p.positionid = a.positionid
  WHERE c.callid = $1
`;


    const result = await pool.query(query, [callID]);

    if (result.rows.length === 0) return null;

    const admin = result.rows[0];
  

    return {
      adminID: admin.adminid,
      name: admin.adminname,
      phoneRegular: admin.phoneregular,
      phoneMobile: admin.phonemobile,
      position: {
        positionID: admin.positionid,
        name: admin.positionname
      }
    };

  } catch (err) {
    console.error("❌ Error fetching admins for call", err);
    return null; // Or [] depending on your app’s expected return type
  }
}


 export async function getNotesByCallId(callID: number) {
  try {
    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
      SELECT
        callnoteid AS "callNoteID",
        note,
        datecreated AS "dateCreated",
        callid AS "callID",
        outbound
      FROM callnotes
      WHERE callid = $1
      ORDER BY datecreated DESC
    `;

    const result = await pool.query(query, [callID]);

    // Replace <br> with \r\n to normalize line breaks, as per previous code.
    return result.rows.map((row) => ({
      ...row,
      note: row.note?.replace(/<br\s*\/?>/gi, "\r\n") || "",
    }));
  } catch (err) {
    console.error(`❌ Error fetching notes for call ID: ${callID}`, err);
    return [];
  }
}



export const getFatEventsPostgress = async (req: AuthRequest, res: Response) => {
  try {
    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const { StartDate } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_events($1)`, // assuming your DB function returns snake_case
      [StartDate]
    );

    const events = result.rows;

    const enrichedEvents = await Promise.all(
      events.map(async (event: any) => {
        const admin = await getAdminsByCall(event.callid);
        //console.log(admin)
        const callNotes = await getNotesByCallId(event.callid);

        // Optional: convert <br> to newline
        for (const callNote of callNotes) {
          callNote.note = callNote.note.replace(/<br\s*\/?>/gi, "\r\n");
        }
//console.log(event.starttime)
        // Re-map fields to preserve original JSON field names
        return {
          eventID: event.eventid,
          description: event.description,
          startTime: formatDateIgnoringUTC(event.starttime),
          endTime: formatDateIgnoringUTC(event.endtime),
          calendarEventId: event.calendareventid,
          customerID: event.customerid,
          customerName: event.customername,
          typeCustomerId: event.typecustomerid,
          customerPostalAddress: event.customerpostaladdress,
          typeID: event.typeid,
          hotelID: event.hotelid,
          hotelDestination: event.hoteldestination,
          notes: event.notes,
          callID: event.callid,
          CALL_GPS: event.call_gps,
          educationRegion: event.educationregion,
          Type: event.type,
          callNote: event.callnote,
          hOTEL: event.hotel, // preserving original casing
          gPS_Location_Destination: event.gps_location_destination,
          destination: event.gps_location_destination, // copied from GPS field
          admin,
          callNotes,
        };
      })
    );

    res.json(enrichedEvents);
  } catch (err) {
    console.error("❌ Error retrieving customers:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
};




  export default getFatEventsPostgress;