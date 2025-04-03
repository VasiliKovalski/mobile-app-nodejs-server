import express from 'express'
import  {  authenticateUserAPI }  from '../config/authMiddleware.js';
import GetTodayAccomodation from '../controllers/hotelController.js';

const router = express.Router();
router.get("/GetTodayAccomodation", authenticateUserAPI, GetTodayAccomodation);

export default router;