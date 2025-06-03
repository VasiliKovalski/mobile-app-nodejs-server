import express from 'express'
import {   getInvoiceDuefunction, payThisInvoice } from '../controllers/invoiceController.js'
import {   getInvoiceDuefunctionPostgress, payThisInvoicePostgress } from '../controllers/Postgress/invoiceController.js'
import  { authenticateUser, authenticateUserAPI }  from '../config/authMiddleware.js';


const router = express.Router();



if (process.env.USE_POSTGRESS) {
   router.get("/GetDueInvoices", authenticateUserAPI, getInvoiceDuefunctionPostgress);
   router.get("/PayThisInvoice", authenticateUserAPI, payThisInvoicePostgress);

} 
  else 
  {
        router.get("/GetDueInvoices", authenticateUserAPI, getInvoiceDuefunction);
        router.get("/PayThisInvoice", authenticateUserAPI, payThisInvoice);
  }



export default router;