import * as yup from "yup";

export const getTermSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    _id: yup.string().nullable().optional(),
    name: yup.string().required(t("validation.required", { field: "name" })),
    description: yup
      .string()
      .required(t("validation.required", { field: "description" })),
    version: yup
      .mixed()
      .oneOf(
        [yup.string(), yup.number()],
        t("validation.invalid_type", { field: "version" })
      )
      .required(t("validation.required", { field: "version" })),
    status: yup
      .string()
      .oneOf(["active", "inactive"], t("validation.invalid_status"))
      .required(t("validation.required", { field: "status" })),
    createdAt: yup.date().optional(),
    updatedAt: yup.date().optional(),
  });
