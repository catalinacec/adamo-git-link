import { Request, Response } from "express";

export class AnalyticsController {
  static async health(req: Request, res: Response) {
    try {
      const isHealthy = true;

      if (isHealthy) {
        return res.status(200).json({
          status: "success",
          message: "Microservice is healthy",
        });
      } else {
        throw new Error("Microservice is not healthy");
      }
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: error.message || "Microservice is not healthy",
      });
    }
  }
}
