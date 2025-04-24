import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import { extractRefNumberFrom, formatDateIgnoringUTC, getTimeDifference } from '../config/util.js';



   export const GetTodayAccomodation = async (req: AuthRequest, res: Response) => {
  
   try {
         
        let timeOffset = getTimeDifference();
         //timeOffset = 18
        console.log('VASYA');

        const pool = await poolPromise;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         // Query to fetch admins linked to the customer
         
         const query = `
      SELECT 
        E.Description AS eventDescription,
        E.EventID AS eventID,
        E.StartTime AS eventStartTime,
        E.EndTime AS eventEndTime,
        E.Notes AS eventNotes,
        H.Description AS hotelDescription,
        H.Name AS hotelName,
        H.Address AS hotelCoordinates,
        H.PhysicalAddress AS hotelPhysicalAddress  
      FROM event E
      INNER JOIN Hotel H ON H.hotelID = E.HotelID
      WHERE DATEADD(hour, @timeOffset, GETDATE()) BETWEEN E.StartTime AND E.EndTime
    `;
         
    const result = await pool.request()
    .input("timeOffset", sql.Int, timeOffset) // Prevent SQL Injection
    .query(query);


    

    //console.log(result.recordset)
          
        //    if (!result.recordset || result.recordset.length === 0) {
        //      res.status(404).json({ message: "No accomodation found" });
        // }
   
       
      const accommodation: IWebApiAccomodation = result.recordset[0];
       if (result.recordset && result.recordset.length > 0) {
        
        accommodation.eventStartTime = formatDateIgnoringUTC(new Date(accommodation.eventStartTime ?? ''));
        accommodation.eventEndTime = formatDateIgnoringUTC(new Date(accommodation.eventEndTime ?? ''));
      } 
      res.json(accommodation)
        
         
       } catch (err) {
         console.error(`❌ Error fetching invoices`, err);
          res.status(500).json({ message: "Internal Server Error" });
       }
  }


  export default GetTodayAccomodation;