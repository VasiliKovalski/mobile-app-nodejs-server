import express from 'express'

import  { authenticateUserAPI }  from '../config/authMiddleware.js';
import {   GetCall } from '../controllers/callController.js'

const router = express.Router();

router.get("/GetCalls", authenticateUserAPI, GetCall);

export default router;