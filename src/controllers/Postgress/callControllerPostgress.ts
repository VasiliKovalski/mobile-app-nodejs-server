import { poolPromisePostGreSQL } from '../../config/db.js';

import {  type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';
import {  formatDateIgnoringUTC } from '../../config/util.js';


   export const GetCallPostgress = async (req: AuthRequest, res: Response) => {
  
   try {
         
    const { customerId } = req.query;
        if (!customerId || customerId.length === 0) {
          res.status(404).json({ message: "No CustomerID supplied" });
          return;
        }

        const pool = await poolPromisePostGreSQL;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         const searchQuery = `select c.callBackDate, c.shortNotes, c.result from calls C  where CustomerID = $1`;

    const result = await pool.query(searchQuery, [customerId]);

   
    const callSrc: Record<string, any>[] = result.rows;

    const finalResult = callSrc.map(call => ({
        shortNotes: call.shortnotes,         // PostgreSQL columns are usually lowercase unless quoted
        result: call.result,
        callBackDate: call.callbackdate,
    }));



        
        res.json(finalResult)
           
       
         
       } catch (err) {
         console.error(`❌ Error fetching call`, err);
          res.status(500).json({ message: "Internal Server Error" });
       }
  }


  export default GetCallPostgress;