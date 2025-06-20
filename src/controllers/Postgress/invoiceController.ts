import { poolPromisePostGreSQL } from '../../config/db.js';
import {  type Response } from "express";
import { type AuthRequest } from '../../config/authMiddleware.js';
import { extractRefNumberFrom, formatDateIgnoringUTC,  } from '../../config/util.js';


export const getInvoiceDuefunctionPostgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
      SELECT 
        C.typecustomerid AS "TypeCustomerID",
        C.name AS "Name",
        C.customerid AS "CustID",
        I.*
      FROM invoice I
      INNER JOIN customers C ON C.customerid = I.customerid
      WHERE I.status IN (1, 3)
    `;

    const result = await pool.query(query);

    if (!result.rows || result.rows.length === 0) {
      res.status(404).json({ message: "No due invoice found" });
      return; // <- important
    }

    const invoiceSrc: Record<string, any>[] = result.rows;

    const finalResult = invoiceSrc.map(invoice => ({
      customer: {
        Name: invoice.Name,
        CustomerID: invoice.CustID,
        TypeCustomerID: invoice.TypeCustomerID,
      },
      customerID: invoice.CustID,
      customerName: invoice.Name,
      invoiceID: invoice.invoiceid,
      total: parseFloat(invoice.total),
      status: invoice.status,
      dateCreated: invoice.datecreated,
      invoiceFileName: invoice.filename,
      referenceData: extractRefNumberFrom(invoice.filename),
      reminderSentDate: invoice.remindersentdate,
      reminderSent: invoice.remindersent,
      date: invoice.date,
      reminderOpened: invoice.opened === null ? 0 : invoice.opened,
    }));

    res.json(finalResult);
  } catch (err) {
    console.error(`❌ Error fetching invoices`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const payThisInvoicePostgress = async (req: AuthRequest, res: Response) => {
  try {
    const pool = await poolPromisePostGreSQL;
    const { invoiceId, status } = req.query;

    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
      UPDATE invoice
      SET status = $1
      WHERE invoiceid = $2
    `;

    await pool.query(query, [status, invoiceId]);

    res.json({ message: "Invoice updated successfully" });
  } catch (err) {
    console.error(`❌ Error updating invoice (payThisInvoice)`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





export default getInvoiceDuefunctionPostgress;