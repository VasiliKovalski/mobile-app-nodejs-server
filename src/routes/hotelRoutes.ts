import express from 'express'
import  {  authenticateUserAPI }  from '../config/authMiddleware.js';
import GetTodayAccomodation from '../controllers/hotelController.js';
import {   GetTodayAccomodationPostgress } from '../controllers/Postgress/hotelControllerPostgress.js'
const router = express.Router();




if (process.env.USE_POSTGRESS) {
   router.get("/GetTodayAccomodation", authenticateUserAPI, GetTodayAccomodationPostgress);
} 
  else 
  {
    router.get("/GetTodayAccomodation", authenticateUserAPI, GetTodayAccomodation);
  }


export default router;