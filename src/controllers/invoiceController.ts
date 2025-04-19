import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import { extractRefNumberFrom, formatDateIgnoringUTC } from '../config/util.js';


export const getInvoiceDuefunction = async (req: AuthRequest, res: Response) => {

  try {

    const pool = await poolPromise;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    // Query to fetch admins linked to the customer
    const result = await pool
      .request()

      .query("select C.TypeCustomerID, C.Name, C.CustomerID as CustID, I.* from Invoice I inner join Customers C on C.CustomerID = I.CustomerID where I.Status in (1, 3)");

    if (!result.recordset || result.recordset.length === 0) {
      res.status(404).json({ message: "No due invoice found" });
    }
    const invoiceSrc: Record<string, any>[] = result.recordset;

    const finalResult = invoiceSrc.map(invoice => ({
      customer: {
        Name: invoice.Name,
        CustomerID: invoice.CustID,
        TypeCustomerID: invoice.TypeCustomerID
      },
      customerID: invoice.CustID,
      customerName: invoice.Name,
      invoiceID: invoice.InvoiceID,
      total: invoice.Total,
      status: invoice.Status,
      dateCreated: formatDateIgnoringUTC(invoice.DateCreated),
      invoiceFileName: invoice.FileName,
      reminderSentDate: invoice.ReminderSentDate,
      referenceData: extractRefNumberFrom(invoice.FileName),
      reminderSent: invoice.ReminderSent,
      date: formatDateIgnoringUTC(invoice.Date),
      reminderOpened: invoice.Opened === null ? 0 : invoice.Opened,


    }));

    res.json(finalResult);



  } catch (err) {
    console.error(`❌ Error fetching invoices`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const payThisInvoice = async (req: AuthRequest, res: Response) => {
  try {

    const pool = await poolPromise;
    const { invoiceId, status } = req.query;
    
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    var query = `UPDATE dbo.Invoice set Status = @status WHERE InvoiceID = @InvoiceID`;
    const result = await pool.request()
    .input("InvoiceID", sql.Int, invoiceId) // Prevent SQL Injection
    .input("status", sql.Int, status) // Prevent SQL Injection
    .query(query);

    res.json();

  } catch (err) {
    console.error(`❌ Error updating invoice (payInvoice)`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}





export default getInvoiceDuefunction;