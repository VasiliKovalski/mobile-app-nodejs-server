import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import {  formatDateIgnoringUTC, getTimeDifference } from '../config/util.js';
import { IWebApiCall } from '../interfaces/IWebApiCall.js';


   export const GetCall = async (req: AuthRequest, res: Response) => {
  
   try {
         
        
        const { customerId } = req.query;

        const pool = await poolPromise;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         // Query to fetch admins linked to the customer
         
         const searchQuery = `
             select c.callBackDate, c.shortNotes, c.result from calls C  where CustomerID = @CustomerID
       `;

         
    const result = await pool.request()
    .input("CustomerID", sql.Int, `${customerId}`) // Prevent SQL Injection
    .query(searchQuery);

   
    const callSrc: Record<string, any>[] = result.recordset;
         
         const finalResult = callSrc.map(call => ({
          shortNotes: call.shortNotes,
          result : call.result,
          callBackDate: formatDateIgnoringUTC(call.callBackDate),


      }));

        
        res.json(finalResult)
           
       
         
       } catch (err) {
         console.error(`❌ Error fetching call`, err);
          res.status(500).json({ message: "Internal Server Error" });
       }
  }


  export default GetCall;