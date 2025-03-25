

import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import { formatDateIgnoringUTC } from '../config/util.js';


 // export const getCalls = async (res: Response): Promise<void> =>  {
//   try {
//     const pool = await poolPromise; 
//     if (!pool) {
//       throw new Error("Database connection failed.");
//     }

//     const result: sql.IResult<any> = await pool.request().query("SELECT TOP 5 * FROM Calls");
//     res.json(result.recordset);
//   } catch (err) {
//     res.status(500).json({ error: "Database query failed", details: err });
//   }
// };

  // export const getSomeCalls = async (res: Response) => {  
  //   try {
  //     const pool = await poolPromise;
  //     if (!pool) {
  //       throw new Error("Database connection failed.");
  //     }
  //     const result: sql.IResult<any> = await pool.request().query("SELECT top 5 * FROM Calls where result = 5");
  //     res.json(result.recordset);
  //   } catch (err) {
  //     res.status(500).json({ error: "Database query failed", details: err});
  //   }
  // };
  

  async function getAdmin(eventId: number) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
      const result = await pool.request()
      .input("CallID", sql.Int, eventId) 
      .query("select *, P.Name as PositionName from Administrators A  " +
                    "   inner join Calls C on A.AdminID = C.AdministratorID " +
                    " inner join Position P on P.PositionID  = A.PositionID " + 
                    " where C.CallID = @CallID");
                    return result.recordset[0] || null;
    } catch (err) {
      console.error(`❌ Error fetching admin for event ${eventId}:`, err);
    return null;
    }
  }
  
  export const getEvents = async (req: AuthRequest, res: Response) => {  
    try {
      const cDate = new Date();
      
      const pool = await poolPromise;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
      const result = await pool
      .request()
      .input("StartTime", sql.DateTime, cDate) // Input parameter
      
      .execute("GETEVENTS"); // Call stored procedure

      const events = result.recordset;
      for (const event of events) {
        event.Description = "HOsdfsdfPA"
        event.admin = await getAdmin(event.CallID); // Wait for each API call before moving to the next event

      };
      
      
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: "Database query failed", details: err });
    }
  };  


  async function getAdminsByCall(callID: number) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
       
      // Query to fetch admins linked to the customer
      const result = await pool
        .request()
        .input("callID", sql.Int, callID)
        .query("SELECT P.positionID, C.customerID, A.AdminID, A.name AS adminName, A.phoneRegular, A.phoneMobile, P.PositionID, P.name AS positionName " +
        "FROM Administrators A " + 
        "INNER JOIN Calls C ON A.AdminID = C.AdministratorID " +
        "INNER JOIN Position P ON P.PositionID = A.PositionID " +
        "WHERE C.CallID = @callID");
        
        if (result.recordset.length === 0) return null;

        const admin = result.recordset[0];

        return {
          adminID: admin.AdminID,
          name: admin.adminName,
          phoneRegular: admin.phoneRegular,
          phoneMobile: admin.phoneMobile,
          position: {
            positionID: admin.PositionID,
            name: admin.positionName
          }
        };  
      
      
    } catch (err) {
      console.error(`❌ Error fetching admins for customer`, err);
      return []; // Return empty array if error
    }
  }

  async function getNotesByCallId(callID: number) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
       
      // Query to fetch admins linked to the customer
      const result = await pool
        .request()
        .input("callID", sql.Int, callID)
        .query("select callNoteID, note, dateCreated, callID, outbound from callNotes where callID = @callID order by dateCreated desc");
  
      
        return result.recordset; // Return list of admins
    } catch (err) {
      console.error(`❌ Error fetching admins for customer `, err);
      return []; // Return empty array if error
    }
  }



   export const getFatEvents = async (req: AuthRequest, res: Response) => {
  
    try {
      const pool = await poolPromise;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
      
      const { StartDate } = req.query;
      //console.log(req.query)
      //startDate.setDate(startDate.getDate() -2);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 4);
      // Fetch all customers
      const result = await pool
      .request()
      .input("StartTime", sql.DateTime, StartDate) // Input parameter
      //.input("EndTime", sql.DateTime, endDate) // Input parameter
      
      .execute("GETEVENTS"); // Call stored procedure
      const events = result.recordset;
        
      // ✅ Fetch admins for each customer in parallel
      const enrichedCustomers = await Promise.all(
        events.map(async (event: any) => {
          const admin = await getAdminsByCall(event.callID); // Get admins for each customer
          const callNotes = await getNotesByCallId(event.callID); // Get admins for each customer
          event.destination = event.gPS_Location_Destination;
          
          //event.startTime_original = event.startTime;          
          event.startTime = formatDateIgnoringUTC(event.startTime);
          
          //console.log('Converted Starttime: ',event.startTime)

          //event.endTime_original = event.endTime;          
          event.endTime = formatDateIgnoringUTC(event.endTime);
          //console.log('Converted EndTime__: ',event.endTime)
          
          
          
          for (const callNote of callNotes) {
            callNote.note = callNote.note.replace(/<br\s*\/?>/g, "\r\n");
    
          };
  
          return {
            ...event,
            admin, // Attach the list of admins
            callNotes
          };
        })
      );
  
      //console.log(enrichedCustomers); // ✅ Final structured data
      //return enrichedCustomers;
      res.json(enrichedCustomers);
    } catch (err) {
      console.error("❌ Error retrieving customers:", err);
    }
  }


  export default getFatEvents;