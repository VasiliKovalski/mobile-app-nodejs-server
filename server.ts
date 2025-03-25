import config from 'dotenv'
import cors from 'cors'
import express from 'express'
import cookieParser from "cookie-parser";
import  userRoutes   from './src/routes/userRoutes.js';
import eventRoutes from "./src/routes/eventRoutes.js";


const port = process.env.PORT || 8080;

const app  = express();

app.use(cookieParser()); 
app.use(cors()); // Allows all origins
app.use(express.json()); 

config.config();// Load environment variables from .env


app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

app.get('/api', (req, res) => { 
     res.json({"users": ["user_19999988889999", "user_29999999", "user_39999999"]})
 })
  
app.listen(port, () => {
     console.log(`Server started at ${port} port `)}
    );
