import express from 'express'
import {   GetAllCustomers, GetTodayCustomers, GetEmailsByCustomer } from '../controllers/customerController.js'
import  { authenticateUserAPI }  from '../config/authMiddleware.js';

const router = express.Router();

router.get("/getAllCustomers", authenticateUserAPI, GetAllCustomers);
router.get("/GetTodayCustomers", authenticateUserAPI, GetTodayCustomers);
router.get("/GetEmailsByCustomerId", authenticateUserAPI, GetEmailsByCustomer);


export default router;