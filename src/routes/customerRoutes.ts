import express from 'express'
//import {   GetAllCustomers, GetTodayCustomers, GetEmailsByCustomer } from '../controllers/customerController.js'
import {   GetAllCustomersPostgress, GetTodayCustomersPostgress, GetEmailsByCustomerPostgress } from '../controllers/Postgress/customerController.js'
import  { authenticateUserAPI }  from '../config/authMiddleware.js';

const router = express.Router();


if (process.env.USE_POSTGRESS) {
router.get("/getAllCustomers", authenticateUserAPI, GetAllCustomersPostgress);
router.get("/GetTodayCustomers", authenticateUserAPI, GetTodayCustomersPostgress);
router.get("/GetEmailsByCustomerId", authenticateUserAPI, GetEmailsByCustomerPostgress);
} else {
  
//router.get("/getAllCustomers", authenticateUserAPI, GetAllCustomers);
//router.get("/GetTodayCustomers", authenticateUserAPI, GetTodayCustomers);
//router.get("/GetEmailsByCustomerId", authenticateUserAPI, GetEmailsByCustomer);
}

export default router;