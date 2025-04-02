import express from 'express'
import {   getInvoiceDuefunction } from '../controllers/invoiceController.js'
import  { authenticateUser, authenticateUserAPI }  from '../config/authMiddleware.js';




const router = express.Router();


router.get("/GetDueInvoices", authenticateUserAPI, getInvoiceDuefunction);

export default router;