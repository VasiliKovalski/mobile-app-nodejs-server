import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import {  formatDateIgnoringUTC, getTimeDifference } from '../config/util.js';
//import { IShowDTO, IRawShow } from '../interfaces/IShowInterfaces.js';

   export const GetShowsNotAssiciatedInvoice = async (req: AuthRequest, res: Response) => {
  
  try {
     const { CustomerID } = req.query;
     
      if (!CustomerID || CustomerID.length === 0) {
        res.status(404).json({ message: "No CustomerID supplied" });
        return;
      }
     
     
     const pool = await poolPromise;
      if (!pool) {
        throw new Error("Database connection failed.");
      }
       
     
      const query = `select * from shows where showid not in (select s.showid from shows S inner join invoice I on S.showid = I.showid 
                     where i.customerid = @CustomerID) and customerid = @CustomerID`;
     
      
 const result = await pool.request()
 .input("CustomerID", sql.Int, CustomerID) // Prevent SQL Injection
 .query(query);
 
 const showsSrc: IRawShow[] = result.recordset;

 const finalResult: IShowDTO[] = showsSrc.map(show => ({
   showID: show.ShowID,
   numberOfPeople: show.NumberOfPeople,
   programID: show.ProgramID,
   price: show.Price,
   notes: show.Notes,
   customerID: show.CustomerID,
   datePerformance: formatDateIgnoringUTC(show.DatePerformance),
 }));
 
 res.json(finalResult);
    
      
    } catch (err) {
      console.error(`❌ Error fetching GetEmailsByCustomer`, err);
       res.status(500).json({ message: "Internal Server Error" });
    }
  }


  export default GetShowsNotAssiciatedInvoice;