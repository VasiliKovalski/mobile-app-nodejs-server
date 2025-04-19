import express from 'express'
import {   getInvoiceDuefunction, payThisInvoice } from '../controllers/invoiceController.js'
import  { authenticateUser, authenticateUserAPI }  from '../config/authMiddleware.js';




const router = express.Router();


router.get("/GetDueInvoices", authenticateUserAPI, getInvoiceDuefunction);
router.get("/PayThisInvoice", authenticateUserAPI, payThisInvoice);


export default router;