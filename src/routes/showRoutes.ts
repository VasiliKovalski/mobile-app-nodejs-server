import express from 'express'

import  { authenticateUserAPI }  from '../config/authMiddleware.js';
import {   GetShowsNotAssiciatedInvoice } from '../controllers/showController.js'

const router = express.Router();

router.get("/GetShowsNotAssiciatedWithInvoice", authenticateUserAPI, GetShowsNotAssiciatedInvoice);

export default router;