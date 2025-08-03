import * as yup from "yup";

export const updateProfileSchema = yup.object().shape({
  name: yup.string().optional(),
  surname: yup.string().optional(),
  language: yup.string().optional(),
  photo: yup.string().optional(),
});
