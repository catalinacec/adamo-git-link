import * as yup from "yup";

export const registerLogSchema = yup.object().shape({
  action: yup.string().required("Action is required"),
  success: yup.boolean().required("Success is required"),
  userId: yup.string().optional(),
  email: yup.string().email("Invalid email format").optional(),
  statusCode: yup.number().integer("StatusCode must be an integer").optional(),
  message: yup.string().optional(),
  payload: yup.mixed().optional(),
  headers: yup.mixed().optional(),
  ip: yup.string().optional(),
  userAgent: yup.string().optional(),
  method: yup.string().optional(),
  path: yup.string().optional(),
  timestamp: yup
    .date()
    .default(() => new Date())
    .required("Timestamp is required"),
});
