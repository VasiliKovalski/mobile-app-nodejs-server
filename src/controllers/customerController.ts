import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import {  getTimeDifference } from '../config/util.js';
import { IWebApiCustomer } from '../interfaces/IWebApiCustomer.js';


   export const GetAllCustomers = async (req: AuthRequest, res: Response) => {
  
   try {
         
        
        const { whatToSearch } = req.query;

        const pool = await poolPromise;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         // Query to fetch admins linked to the customer
         
         const searchQuery = `
         SELECT DISTINCT Cus.customerID, Cus.typeCustomerID, Cus.decile, Cus.numberPeople, Cus.name, Cus.gps
         FROM Customers Cus
         LEFT OUTER JOIN Administrators A ON Cus.CustomerID = A.CustomerID
         LEFT OUTER JOIN AdminEmail AE ON AE.AdminID = A.AdminID
         LEFT OUTER JOIN Invoice I ON I.CustomerID = Cus.CustomerID
         WHERE (
           A.Name LIKE @condition OR
           Cus.Name LIKE @condition OR
           A.Email LIKE @condition OR
           A.PhoneMobile LIKE @condition OR
           AE.Address LIKE @condition OR
           I.FileName LIKE @condition OR
           Cus.EMail LIKE @condition
         ) AND Cus.CountryID = 1
       `;

        

         
    const result = await pool.request()
    .input("condition", sql.VarChar, `%${whatToSearch}%`) // Prevent SQL Injection
    .query(searchQuery);

   
   
       const customer: IWebApiCustomer = result.recordset;
        
        res.json(customer)
           
       
         
       } catch (err) {
         console.error(`❌ Error fetching invoices`, err);
          res.status(500).json({ message: "Internal Server Error" });
       }
  }


  export default GetAllCustomers;