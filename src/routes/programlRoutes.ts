import express from 'express'

import  { authenticateUserAPI }  from '../config/authMiddleware.js';
import {   GetPrograms } from '../controllers/programController.js'

const router = express.Router();

router.get("/getPrograms", authenticateUserAPI, GetPrograms);

export default router;