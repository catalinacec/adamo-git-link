import { ValidationError } from "yup";

export function formatYupErrors(
  innerErrors: ValidationError[],
  t: (key: string, vars?: Record<string, any>) => string
): string[] {
  return innerErrors.map((err) => t(err.message || "validation.unknown"));
}
