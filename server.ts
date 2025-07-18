import config from 'dotenv'
import cors from 'cors'
import express from 'express'
import cookieParser from "cookie-parser";
import userRoutes   from './src/routes/userRoutes.js';
import eventRoutes from "./src/routes/eventRoutes.js";
import invoiceRoutes from "./src/routes/invoiceRoutes.js";
import hotelRoutes from "./src/routes/hotelRoutes.js";
import customerRequestRoutes from "./src/routes/customerRequestRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import callRoutes from "./src/routes/callRoutes.js";
import programRoutes from "./src/routes/programlRoutes.js";
import showRoutes from "./src/routes/showRoutes.js";



const port = process.env.PORT || 8080;

const app  = express();

app.use(cookieParser()); 

app.use(cors({
  origin: ['https://your-frontend.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  
}));

app.use(express.json()); 

config.config();// Load environment variables from .env

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/CustomerRequest", customerRequestRoutes);
app.use("/api/Customer", customerRoutes);
app.use("/api/Call", callRoutes);
app.use("/api/Program", programRoutes);
app.use("/api/Show", showRoutes);


app.get('/api', (req, res) => { 
     res.json({"users": ["user_19999988889999", "user_29999999", "user_39999999"]})
 })
  
app.listen(port, () => {
     console.log(`Server started at ${port} port `)}
    );
