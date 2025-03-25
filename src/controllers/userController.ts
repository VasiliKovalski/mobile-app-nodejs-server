import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response, type NextFunction  } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const users: { username: string; password: string }[] = [];
export interface ICustomer {
  CustomerID: number;
  Name: string;
  Email: string;
  Phone: string;
}
const SECRET_KEY = process.env.JWT_SECRET == undefined ? 'MySecret' : process.env.JWT_SECRET;
const USERNAME = process.env.LOGIN_USERNAME == undefined ? 'MySecret' : process.env.LOGIN_USERNAME;
const PASSWORD = process.env.LOGIN_PASSWORD == undefined ? 'MySecret' : process.env.LOGIN_PASSWORD;

export interface IUserRequest {
  username: string;
  password: string;
}



const getCustomers = async (): Promise<ICustomer[]> => {
  try {
    const pool = await poolPromise; // ✅ Get the DB connection pool

    if (!pool) {
      throw new Error("Database connection failed.");
    }

    
    const result = await pool.request().query("SELECT top 10 * FROM Customers");
    return result.recordset; // ✅ Return the customers list
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    throw error;
  }
};

export const userLoginHandler = async (req: Request, res: Response) => {
  try {
    
    const { username, password } = req.body as IUserRequest;
    //  console.log(USERNAME);
    //  console.log(username);
    //  console.log(PASSWORD);
    //  console.log(password);

    if (username !== USERNAME || password !== PASSWORD)
    {
           res.status(401).json({ message: "Invalid username or password" });
           return;

      }

    //console.log(SECRET_KEY);    
     const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
     
     res.cookie("authToken", token, {
      httpOnly: false, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "none",
      maxAge: 3600000, // 1 hour 
    });

    //console.log(token);
    //console.log(username)
    res.json({ message: 'User authenticated' });
  } catch (error) {
    res.status(500).json({ error: "Failed to user login" });
  }
};


// const getUsers = async (res: Response) => {
//   try {

//     const pool = await poolPromise; 
//     if (!pool) {
//       throw new Error("Database connection failed.");
//     }

//       const result: sql.IResult<any> = await pool.request().query("SELECT top 5 * FROM Calls where result = 5");
    
//     res.json(result.recordset);
//   } catch (err) {
//     //res.status(500).json({ error: "Database query failed", details: err });
//   }
// };

export const userLogin = async (req:Request, res:Response) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      throw new Error("Database connection failed.");
    }
    //const result = await pool.request().query("SELECT top 5 * FROM customers");
    const { username, password } = req.body;
  // Generate JWT token
  //const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    //console.log(token);
    //console.log(username)
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Database query failed", details: err });
  }
};

