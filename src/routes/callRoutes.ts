import express from 'express'

import  { authenticateUserAPI }  from '../config/authMiddleware.js';
import { GetCallPostgress } from '../controllers/Postgress/callControllerPostgress.js';
import {   GetCall } from '../controllers/callController.js'

const router = express.Router();


//USE_POSTGRESS

if (process.env.USE_POSTGRESS) {
router.get("/GetCalls", authenticateUserAPI, GetCallPostgress);
} else {
  
  router.get("/GetCalls", authenticateUserAPI, GetCall);
}


export default router;