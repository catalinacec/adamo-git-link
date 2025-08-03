import { z } from "zod";

export const getContactSchema = (t: (key: string) => string) =>
  z.object({
    id: z.string().optional().default(""),
    firstName: z
      .string()
      .min(1, t("contactForm.validation.firstNameRequired"))
      .max(50, t("contactForm.validation.firstNameMaxLength")),
    lastName: z
      .string()
      .min(1, t("contactForm.validation.lastNameRequired"))
      .max(50, t("contactForm.validation.lastNameMaxLength")),
    email: z
      .string()
      .min(1, t("contactForm.validation.emailRequired"))
      .email(t("contactForm.validation.emailInvalid")),
    countryCode: z.string().optional(),
    phone: z.string().optional(),
    company: z
      .string()
      .max(100, t("contactForm.validation.companyMaxLength"))
      .optional(),
    position: z
      .string()
      .max(50, t("contactForm.validation.positionMaxLength"))
      .optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
    country: z.string().optional(),
    cityRegion: z.string().optional(),
  }).refine(
    (data) =>
      (!data.phone && !data.countryCode) || (data.phone && data.countryCode),
    {
      message: t("contactForm.validation.phoneCountryCodeRequired"),
      path: ["phone"],
    }
  );

// Legacy schema for backward compatibility
export const contactSchema = z.object({
  id: z.string().optional().default(""),
  firstName: z
    .string()
    .min(1, "Nombre/s es requerido")
    .max(50, "Máximo 50 caracteres"),
  lastName: z
    .string()
    .min(1, "Apellido/s es requerido")
    .max(50, "Máximo 50 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().max(100, "Máximo 100 caracteres").optional(),
  position: z.string().max(50, "Máximo 50 caracteres").optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  country: z.string().optional(),
  cityRegion: z.string().optional(),
}).refine(
  (data) =>
    (!data.phone && !data.countryCode) || (data.phone && data.countryCode),
  {
    message: "You must provide both phone and country code or neither.",
    path: ["phone"],
  }
);

export type ContactType = z.infer<typeof contactSchema>;
