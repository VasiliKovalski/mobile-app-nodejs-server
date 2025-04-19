import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import {  formatDateIgnoringUTC,  } from '../config/util.js';



   export const GetPrograms = async (req: AuthRequest, res: Response) => {
  
   try {
        const pool = await poolPromise;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         // Query to fetch admins linked to the customer
         
         const query = `SELECT programID, description, note, invoiceDescription, businessType FROM Program`;
         
    const result = await pool.request()
    .query(query);

       
      const programs = result.recordset;
      res.json(programs)
        
         
       } catch (err) {
         console.error(`❌ Error fetching programs`, err);
          res.status(500).json({ message: "Internal Server Error" });
       }
  }


  export default GetPrograms;