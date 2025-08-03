import { z } from "zod";

const passwordRequirements = {
  regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/,
};

// Validation schema for sign-in form
export const getSignInSchema = () =>
  z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z
      .string()
      .min(8, "")
      .regex(passwordRequirements.regex, "")
      .refine((password) => !/\s/.test(password), {
        message: "",
      }),
  });

// Infer the TypeScript types from the schema
export type SignInInputs = z.infer<ReturnType<typeof getSignInSchema>>;
