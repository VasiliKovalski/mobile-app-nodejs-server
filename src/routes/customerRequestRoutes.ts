import express from 'express'
import  {  authenticateUserAPI }  from '../config/authMiddleware.js';
import { GetCustomerRequestsLight, DeleteCustomerRequest, SendEmailToPrivateClient } from '../controllers/customerRequestController.js';

const router = express.Router();
router.get("/GetCustomerRequestsNew", authenticateUserAPI, GetCustomerRequestsLight);
router.get("/DeleteCustomerRequest", authenticateUserAPI, DeleteCustomerRequest);
router.post("/SendEmailToPrivateClient", authenticateUserAPI, SendEmailToPrivateClient);

export default router;