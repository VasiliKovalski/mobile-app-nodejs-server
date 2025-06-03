import express from 'express'

import  { authenticateUserAPI }  from '../config/authMiddleware.js';
import {   GetShowsNotAssiciatedInvoice } from '../controllers/showController.js'
import {   GetShowsNotAssiciatedInvoicePostgress } from '../controllers/Postgress/showController.js'

const router = express.Router();




if (process.env.USE_POSTGRESS) {
     router.get("/GetShowsNotAssiciatedWithInvoice", authenticateUserAPI, GetShowsNotAssiciatedInvoicePostgress);
} 
  else 
  {
      router.get("/GetShowsNotAssiciatedWithInvoice", authenticateUserAPI, GetShowsNotAssiciatedInvoice);
 }


export default router;