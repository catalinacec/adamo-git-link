import { ApiResponse } from "../domain/models/api-response.model";

export function successResponse<T>(message: string, data?: T) {
  return new ApiResponse<T>(
    message,
    data ?? null,
    undefined,
    undefined,
    new Date()
  );
}

export function errorResponse(
  error: any,
  message: string,
  code = "DOCUMENT_ERROR"
) {
  return new ApiResponse(
    message,
    null,
    [code, error?.message || "Unknown error"],
    undefined,
    new Date()
  );
}
