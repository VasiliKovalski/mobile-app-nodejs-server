
import express from 'express'
import  { userLoginHandler } from '../controllers/userController.js'



const router = express.Router();

//router.post("/", getCustomersHandler);
router.post("/login", userLoginHandler);


export default router;