// src/infrastructure/services/s3.instance.ts
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3!,
  },
});

export default s3;
