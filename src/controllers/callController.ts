import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import {  formatDateIgnoringUTC } from '../config/util.js';


   export const GetCall = async (req: AuthRequest, res: Response) => {
  
   try {
      console.log(process.env.USE_POSTGRESS)
    console.log('MS SQL is in use');    
        const { customerId } = req.query;
        if (!customerId || customerId.length === 0) {
          res.status(404).json({ message: "No CustomerID supplied" });
          return;
        }

        const pool = await poolPromise;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         const searchQuery = `select c.callBackDate, c.shortNotes, c.result from calls C  where CustomerID = @CustomerID`;

         
    const result = await pool.request()
    .input("CustomerID", sql.Int, `${customerId}`) 
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