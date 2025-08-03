import { z } from "zod";

// Validation schema for reset-password form
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email is too long")
    .refine((email) => email.trim().length > 0, "Email cannot be empty"),
});

// Infer the TypeScript types from the schema
export type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;
