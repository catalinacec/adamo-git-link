import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY as string).replace(
  /\\n/g,
  "\n"
);

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token missing",
      data: null,
    });
    return;
  }

  jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ["RS256"] }, (err, user) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: "Invalid token",
        data: null,
      });
      return;
    }
    (req as any).user = user;
    next();
  });
}
