// import sql from 'mssql'
// import { poolPromise } from '../config/db.js';
// import {  type Response } from "express";
// import { type AuthRequest } from '../config/authMiddleware.js';

// import { IWebApiCustomer } from '../interfaces/IWebApiCustomer.js';
// import {  getTimeDifference } from '../config/util.js';



// function groupEmails(list: { email: string }[]): ICustomerEmail[] {
//   const grouped = new Map<string, number>();
//   const result: ICustomerEmail[] = [];

//   let id = 1;
//   for (const item of list) {
//     const trimmedEmail = item.email.trim();
//     if (!grouped.has(trimmedEmail)) {
//       grouped.set(trimmedEmail, id);
//       result.push({ email: trimmedEmail, emailID: id });
//       id++;
//     }
//   }

//   return result;
// }


// export const GetEmailsByCustomer = async (req: AuthRequest, res: Response) => {
//   try {
//     const { CustomerID } = req.query;
    
//      if (!CustomerID || CustomerID.length === 0) {
//        res.status(404).json({ message: "No CustomerID supplied" });
//        return;
//      }
    
    
//     const pool = await poolPromise;
//      if (!pool) {
//        throw new Error("Database connection failed.");
//      }
      
    
//      const query = `select  AE.Address as email   from administrators A  
//       inner join AdminEmail AE on AE.AdminID = A.AdminID 
//       inner join Customers C on C.CustomerID = A.CustomerID where C.CustomerID = @CustomerID 
//       group by AE.Address 
//       union all 
//       select   A.Email as Address from administrators A 
//       inner   join Customers C on C.CustomerID = A.CustomerID where C.CustomerID = @CustomerID 
//       group by A.email`;

    
     
// const result = await pool.request()
// .input("CustomerID", sql.Int, CustomerID) // Prevent SQL Injection
// .query(query);

//    const emails = result.recordset;

//    const newList = groupEmails(emails);
    
//     res.json(newList)
   
     
//    } catch (err) {
//      console.error(`❌ Error fetching GetEmailsByCustomer`, err);
//       res.status(500).json({ message: "Internal Server Error" });
//    }

// }



// export const GetTodayCustomers = async (req: AuthRequest, res: Response) => {
//     try {
//       const { CustomerID } = req.query;
      
//       // if (!CustomerID || CustomerID.length === 0) {
//       //   res.status(404).json({ message: "No CustomerID supplied" });
//       //   return;
//       // }
//       let timeOffset = getTimeDifference();
      
//       const pool = await poolPromise;
//        if (!pool) {
//          throw new Error("Database connection failed.");
//        }
        
      
//       const orderBy = " ORDER BY DUEDATE";

//       const timeCondition = "AND DUEDATE >= DATEADD(DAY, DATEDIFF(DAY, '19000101', DATEADD(hour, @timeOffset, getdate())), '19000101') AND DUEDATE <= DATEADD(DAY, DATEDIFF(DAY, '18991231', DATEADD(hour, @timeOffset, getdate())), '19000101')";
//       const statusCondition = " AND STATUS in (5, 10)";

//       const query = "SELECT name, CUSTID as customerID, typeCustomerID  FROM CustomerCalls " + // selecting from view
//         "WHERE 1=1 " +
//         timeCondition +
//         statusCondition +
//         orderBy;

       
//   const result = await pool.request()
//   .input("timeOffset", sql.Int, timeOffset) // Prevent SQL Injection
//   .query(query);
 
//      const customers: IWebApiCustomer = result.recordset;
      
//       res.json(customers)
     
       
//      } catch (err) {
//        console.error(`❌ Error fetching GetTodayCustomers`, err);
//         res.status(500).json({ message: "Internal Server Error" });
//      }
//    }
   
//    export const GetAllCustomers = async (req: AuthRequest, res: Response) => {
  
//    try {
//         const { whatToSearch } = req.query;
//         const pool = await poolPromise;
//          if (!pool) {
//            throw new Error("Database connection failed.");
//          }
          
        
//          const searchQuery = `
//          SELECT DISTINCT Cus.customerID, Cus.typeCustomerID, Cus.decile, Cus.numberPeople, Cus.name, Cus.gps
//          FROM Customers Cus
//          LEFT OUTER JOIN Administrators A ON Cus.CustomerID = A.CustomerID
//          LEFT OUTER JOIN AdminEmail AE ON AE.AdminID = A.AdminID
//          LEFT OUTER JOIN Invoice I ON I.CustomerID = Cus.CustomerID
//          WHERE (
//            A.Name LIKE @condition OR
//            Cus.Name LIKE @condition OR
//            A.Email LIKE @condition OR
//            A.PhoneMobile LIKE @condition OR
//            AE.Address LIKE @condition OR
//            I.FileName LIKE @condition OR
//            Cus.EMail LIKE @condition
//          ) AND Cus.CountryID = 1
//        `;

         
//     const result = await pool.request()
//     .input("condition", sql.VarChar, `%${whatToSearch}%`) // Prevent SQL Injection
//     .query(searchQuery);
   
//        const customer: IWebApiCustomer = result.recordset;
        
//         res.json(customer)
       
         
//        } catch (err) {
//          console.error(`❌ Error fetching GetAllCustomers`, err);
//           res.status(500).json({ message: "Internal Server Error" });
//        }
//   }


//   export default GetAllCustomers;