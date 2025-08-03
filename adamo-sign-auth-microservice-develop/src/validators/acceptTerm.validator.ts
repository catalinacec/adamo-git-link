import * as yup from "yup";

export const getAcceptTermSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    _id: yup
      .string()
      .nullable()
      .required(t("validation.required", { field: "_id" })),
    status: yup
      .string()
      .oneOf(["accepted", "rejected"], t("validation.invalid_status"))
      .required(t("validation.required", { field: "status" })),
  });
