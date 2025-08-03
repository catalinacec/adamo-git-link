import { z } from "zod";

const passwordRequirements = {
  regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/,
};

export const getNewPasswordSchema = (tForm: (key: string) => string) =>
  z
    .object({
      oldPassword: z
        .string()
        .regex(passwordRequirements.regex, tForm("validation.invalid_string"))
        .refine((password) => !/\s/.test(password), {
          message: tForm("validation.no_spaces"),
        }),
      newPassword: z
        .string()
        .regex(passwordRequirements.regex, tForm("validation.invalid_string"))
        .refine((password) => !/\s/.test(password), {
          message: tForm("validation.no_spaces"),
        }),
      confirmPassword: z
        .string()
        .min(8, tForm("validation.too_small")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tForm("validation.custom"),
      path: ["confirmPassword"],
    });

export type newPasswordInputs = z.infer<
  ReturnType<typeof getNewPasswordSchema>
>;
