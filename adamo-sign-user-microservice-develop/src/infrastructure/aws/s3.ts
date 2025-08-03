// src/infrastructure/aws/s3.ts
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3 || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3 || "",
  },
  signatureVersion: "v4",
});

export default s3;
// region: process.env.AWS_REGION,
// accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3,
// secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3,
// signatureVersion: "v4",

// region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3 || "",
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3 || "",
//   },
//   signatureVersion: "v4",
