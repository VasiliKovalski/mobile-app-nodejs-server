import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { loadAppSettings } from "./util.js";


const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// ✅ Extend Request type to include 'user'
export interface AuthRequest extends Request {
  user?: any;
}

// ✅ Ensure `authenticateUser` is an Express Middleware with `NextFunction`
export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.authToken;
    const header = req.headers["api_secret"];
    
    console.log('header in authenticateUser: ', header);

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No Token" });
      return;
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // ✅ Attach user data to request

    next(); // ✅ Correctly move to next middleware
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authenticateUserAPI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
      const settings = await loadAppSettings('settings.json');

    const header = req.headers["api_secret"];
    //console.log('HEADER: ',header);

    if (header != settings?.API_SECRET) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    next(); // ✅ Correctly move to next middleware
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};