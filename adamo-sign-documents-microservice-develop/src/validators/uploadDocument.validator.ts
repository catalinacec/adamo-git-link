import * as yup from "yup";
import { ETypeNotification } from "../domain/models/participant.entity";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // bytes
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / 1024 / 1024; // megabytes
const ALLOWED_EXTS = ["pdf", "docx"];

export const getParticipantSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object({
    first_name: yup
      .string()
      .required(t("validation.required", { field: "first_name" })),
    last_name: yup
      .string()
      .required(t("validation.required", { field: "last_name" })),
    email: yup
      .string()
      .email(t("validation.invalid_email"))
      .required(t("validation.required", { field: "email" })),
    typeNotification: yup
      .string()
      .oneOf(
        Object.values(ETypeNotification),
        t("validation.invalid_type", {
          field: "typeNotification",
          types: Object.values(ETypeNotification).join(", "),
        })
      )
      .required(t("validation.required", { field: "typeNotification" })),
    phone: yup.string().when("typeNotification", {
      is: (val: ETypeNotification) =>
        val === ETypeNotification.WHATSAPP ||
        val === ETypeNotification.TELEGRAM,
      then: (schema) =>
        schema.required(t("validation.required", { field: "phone" })),
      otherwise: (schema) => schema.notRequired(),
    }),
    signatures: yup
      .array()
      .of(
        yup.object({
          signatureContentFixed: yup
            .boolean()
            .required(
              t("validation.required", { field: "signatureContentFixed" })
            ),
          slideElement: yup
            .string()
            .required(t("validation.required", { field: "slideElement" })),
          color: yup
            .string()
            .required(t("validation.required", { field: "color" })),
          width: yup
            .number()
            .required(t("validation.required", { field: "width" })),
          height: yup
            .number()
            .required(t("validation.required", { field: "height" })),
          rotation: yup
            .number()
            .required(t("validation.required", { field: "rotation" })),
        })
      )
      .required(t("validation.required", { field: "signatures" }))
      .min(1, t("validation.min_array", { field: "signatures", min: 1 })),
  });

export const getUploadDocumentSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) => {
  const participantSchema = getParticipantSchema(t);

  return yup.object({
    file: yup
      .mixed<Express.Multer.File>()
      .required(t("validation.required", { field: "file" }))
      .test(
        "fileSize",
        t("validation.file.max_size", { size: MAX_FILE_SIZE_MB }),
        (file) => !!file && file.size <= MAX_FILE_SIZE
      )
      .test(
        "fileType",
        t("validation.file.invalid_type", {
          types: "pdf, docx",
        }),
        (file) => {
          if (!file) return false;
          const ext = file.originalname.split(".").pop()?.toLowerCase();
          return !!ext && ALLOWED_EXTS.includes(ext);
        }
      ),
    filename: yup
      .string()
      .required(t("validation.required", { field: "filename" })),
    owner: yup.string().required(t("validation.required", { field: "owner" })),
    status: yup
      .string()
      .oneOf(
        ["draft", "sent", "signed", "in_progress", "rejected"],
        t("validation.invalid_status")
      )
      .required(t("validation.required", { field: "status" })),
    participants: yup
      .array()
      .required(t("validation.required", { field: "participants" }))
      .transform((value) => {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return value;
      })
      .of(participantSchema)
      .test(
        "not-empty",
        t("validation.min_array", { field: "participants", min: 1 }),
        (arr) => Array.isArray(arr) && arr.length > 0
      ),
  });
};

export const getPartialUploadDocumentSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) => {
  const participantSchema = getParticipantSchema(t);

  return yup.object({
    file: yup
      .mixed<Express.Multer.File>()
      .required(t("validation.required", { field: "file" }))
      .test(
        "fileSize",
        t("validation.file.max_size", { size: MAX_FILE_SIZE_MB }),
        (file) => !!file && file.size <= MAX_FILE_SIZE
      )
      .test(
        "fileType",
        t("validation.file.invalid_type", {
          types: "pdf, docx",
        }),
        (file) => {
          if (!file) return false;
          const ext = file.originalname.split(".").pop()?.toLowerCase();
          return !!ext && ALLOWED_EXTS.includes(ext);
        }
      ),
    filename: yup
      .string()
      .required(t("validation.required", { field: "filename" })),
    owner: yup.string().required(t("validation.required", { field: "owner" })),
    status: yup
      .string()
      .oneOf(
        ["draft", "sent", "signed", "in_progress", "rejected"],
        t("validation.invalid_status")
      )
      .required(t("validation.required", { field: "status" })),
    participants: yup
      .array()
      .transform((value) => {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return value;
      })
      .of(participantSchema),
  });
};
