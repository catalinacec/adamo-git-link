import { ApiResponse, Pagination } from "../domain/models/api-response.model";

export function successResponse<T>(
  message: string,
  data?: T,
  pagination?: Pagination
) {
  return new ApiResponse<T>(
    message,
    data ?? null,
    undefined,
    pagination,
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
