import { z } from "zod";

const urlSchema = z.string().url("Invalid URL format");

const verificationsSchema = z.object({
  selfie: z.boolean(),
  document: z.boolean(),
  identity: z.boolean(),
  facial: z.boolean(),
  phone: z.boolean(),
  email: z.boolean(),
});

export const participantSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z
    .string()
    .email("Invalid email address")
    .refine(() => {
      return true;
    })
    .refine((value) => value !== "gorillahashcompany@gmail.com", {
      message: "Email is not Allowed",
    }),
  listContact: z.boolean().optional(),
  verifications: verificationsSchema,
  color: z.string().optional(),
});

export const documentSchema = z.object({
  file: z.union([z.instanceof(File), urlSchema]),
  name: z.string().min(1, "Document name is required").max(100),
  sign: z.boolean(),
  participants: z
    .array(participantSchema)
    .min(1, "At least one participant is required")
    .refine(
      (participants) => {
        // Check if email addresses are unique across participants
        const emails = participants.map((p) => p.email.toLowerCase());
        const uniqueEmails = new Set(emails);
        return emails.length === uniqueEmails.size;
      },
      {
        message:
          "Duplicate emails found. Ensure each participant has a unique email.",
      },
    )
    .superRefine((participants, ctx) => {
      // Add specific errors for each duplicate email
      const emailCounts = participants.reduce(
        (acc, p, index) => {
          const email = p.email.toLowerCase();
          acc[email] = acc[email] || [];
          acc[email].push(index);
          return acc;
        },
        {} as Record<string, number[]>,
      );

      for (const [email, indices] of Object.entries(emailCounts)) {
        if (indices.length > 1) {
          indices.forEach((index) => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, "email"],
              message: `Email "${email}" is duplicated.`,
            });
          });
        }
      }
    }),
  participantSendMethods: z.record(z.string()).optional(),
  participantPhoneData: z.record(z.object({
    countryCode: z.string(),
    phone: z.string(),
  })).optional(),
  sendReminder: z.boolean().optional(),
  allowRejection: z.boolean().optional(),
});

export type DocumentInputs = z.infer<typeof documentSchema>;
export type ParticipantInputs = z.infer<typeof participantSchema>;
