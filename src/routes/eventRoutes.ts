import express from 'express'
import {   getEvents, getFatEvents } from '../controllers/eventController.js'
import {   getFatEventsPostgress } from '../controllers/Postgress/eventControllerPostgress.js'

import  { authenticateUser, authenticateUserAPI }  from '../config/authMiddleware.js';




const router = express.Router();

if (process.env.USE_POSTGRESS) {
router.get("/GetEvents", authenticateUserAPI, getFatEventsPostgress);
} else {
  
router.get("/GetEvents", authenticateUserAPI, getFatEvents);
}


export default router;