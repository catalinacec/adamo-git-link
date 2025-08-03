import { z } from "zod";

// Validation schema for otp form
export const getOtpSchema = (t: (key: string) => string) =>
  z.object({
    otp: z
      .string()
      .min(1, t("validation.required"))
      .length(6, t("validation.exactLength"))
      .regex(/^[A-Za-z0-9]{6}$/, t("validation.alphanumericOnly"))
      .refine((otp) => otp.trim().length === 6, t("validation.noSpaces")),
  });

// Infer the TypeScript types from the schema
export type OTPInputs = z.infer<ReturnType<typeof getOtpSchema>>;
