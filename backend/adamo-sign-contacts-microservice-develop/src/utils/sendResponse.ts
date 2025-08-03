import { Response } from "express";
import { ApiResponse } from "../domain/models/api-response.model";

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
  pagination?: ApiResponse<T>["pagination"]
) {
  const payload: ApiResponse<T> = {
    message,
    data,
    pagination,
    timestamp: new Date(),
  };

  return res.status(statusCode).json(payload);
}
