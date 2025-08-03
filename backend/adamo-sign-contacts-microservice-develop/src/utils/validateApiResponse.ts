export function isApiResponse(data: any): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.message === "string" &&
    "timestamp" in data &&
    ("data" in data || "errors" in data)
  );
}
