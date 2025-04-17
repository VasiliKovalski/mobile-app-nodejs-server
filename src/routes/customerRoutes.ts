import express from 'express'
import {   GetAllCustomers } from '../controllers/customerController.js'
import  { authenticateUserAPI }  from '../config/authMiddleware.js';

const router = express.Router();

router.get("/getAllCustomers", authenticateUserAPI, GetAllCustomers);

export default router;