import * as yup from "yup";

export const getUpdateDocumentSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) => {
  return yup
    .object({
      filename: yup.string(),
    })
    .test("at-least-one", t("validation.at_least_one_required"), (value) => {
      return !!value?.filename;
    });
};
