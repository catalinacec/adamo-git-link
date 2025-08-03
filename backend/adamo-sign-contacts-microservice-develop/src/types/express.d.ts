import "express";

declare global {
  namespace Express {
    interface Request {
      t: (key: string, vars?: Record<string, any>) => string;
      user?: { id: string; language?: string };
      token?: string;
    }
  }
}
