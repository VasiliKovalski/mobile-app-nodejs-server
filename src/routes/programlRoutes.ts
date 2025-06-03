import express from 'express'

import  { authenticateUserAPI }  from '../config/authMiddleware.js';
import {   GetPrograms } from '../controllers/programController.js'
import {   GetProgramsPostgress } from '../controllers/Postgress/programController.js'

const router = express.Router();


if (process.env.USE_POSTGRESS) {
     router.get("/getPrograms", authenticateUserAPI, GetProgramsPostgress);
} 
  else 
  {
     router.get("/getPrograms", authenticateUserAPI, GetPrograms); 
 }


export default router;