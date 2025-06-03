import { poolPromisePostGreSQL } from '../../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';
import {  getTimeDifference } from '../../config/util.js';



function groupEmails(list: { email: string }[]): ICustomerEmail[] {
  const grouped = new Map<string, number>();
  const result: ICustomerEmail[] = [];

  let id = 1;
  for (const item of list) {
    const trimmedEmail = item.email.trim();
    if (!grouped.has(trimmedEmail)) {
      grouped.set(trimmedEmail, id);
      result.push({ email: trimmedEmail, emailID: id });
      id++;
    }
  }

  return result;
}


export const GetEmailsByCustomerPostgress = async (req: AuthRequest, res: Response) => {
  try {
    const { CustomerID } = req.query;

    if (!CustomerID || CustomerID.length === 0) {
      res.status(400).json({ message: "No CustomerID supplied" });
      return;
    }

    const pool = await poolPromisePostGreSQL;
    if (!pool) throw new Error("Database connection failed.");

    const query = `
      SELECT AE.address AS email
      FROM administrators A
      INNER JOIN adminemail AE ON AE.adminid = A.adminid
      INNER JOIN customers C ON C.customerid = A.customerid
      WHERE C.customerid = $1
      GROUP BY AE.address

      UNION ALL

      SELECT A.email AS email
      FROM administrators A
      INNER JOIN customers C ON C.customerid = A.customerid
      WHERE C.customerid = $1
      GROUP BY A.email;
    `;

    const result = await pool.query(query, [CustomerID]);
    const emails = result.rows;

    const newList = groupEmails(emails); // Assuming your own grouping logic
    res.json(newList);
  } catch (err) {
    console.error("❌ Error fetching GetEmailsByCustomer", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetTodayCustomersPostgress = async (req: AuthRequest, res: Response) => {
  try {
   
    const pool = await poolPromisePostGreSQL;
    if (!pool) throw new Error("Database connection failed.");

    // Convert timeOffset hours to interval (PostgreSQL uses intervals for date math)
    const offsetHours = getTimeDifference();

   const query = `
  SELECT name, custid AS "customerID", typecustomerid
  FROM customer_calls
  WHERE duedate >= DATE_TRUNC('day', CURRENT_TIMESTAMP + ($1 || ' hours')::interval)
    AND duedate < DATE_TRUNC('day', CURRENT_TIMESTAMP + ($1 || ' hours')::interval) + INTERVAL '1 day'
    AND status IN (5, 10)
  ORDER BY duedate;
`;

const result = await pool.query(query, [offsetHours.toString()]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching GetTodayCustomers", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

   export const GetAllCustomersPostgress = async (req: AuthRequest, res: Response) => {
  try {
    const { whatToSearch } = req.query;

    const pool = await poolPromisePostGreSQL;
    if (!pool) throw new Error("Database connection failed.");

    const searchQuery = `
      SELECT DISTINCT
        cus.customerid as "customerID",
        cus.typecustomerid,
        cus.decile,
        cus.numberpeople,
        cus.name,
        cus.gps
      FROM customers cus
      LEFT JOIN administrators a ON cus.customerid = a.customerid
      LEFT JOIN adminemail ae ON ae.adminid = a.adminid
      LEFT JOIN invoice i ON i.customerid = cus.customerid
      WHERE (
        a.name ILIKE $1 OR
        cus.name ILIKE $1 OR
        a.email ILIKE $1 OR
        a.phonemobile ILIKE $1 OR
        ae.address ILIKE $1 OR
        i.filename ILIKE $1 OR
        cus.email ILIKE $1
      ) AND cus.countryid = 1;
    `;

    const result = await pool.query(searchQuery, [`%${whatToSearch}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching GetAllCustomers", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


  export default GetAllCustomersPostgress;