// src/infrastructure/services/s3.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { pipeline } from "stream";
import { promisify } from "util";
import * as fs from "fs";

dotenv.config();
const streamPipeline = promisify(pipeline);

export class S3Service {
  public readonly client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3!,
    },
  });
  private readonly bucket = process.env.AWS_S3_BUCKET_NAME!;

  async uploadAndGetPublicUrl(
    file: Express.Multer.File,
    folder: string,
    expiresIn = 604800
  ): Promise<{ signedUrl: string; key: string; documentName: string }> {
    const ext = file.originalname.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    const key = `${folder}/${filename}`;

    // sube a S3
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // firma la URL
    const signedUrl = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn }
    );

    return { signedUrl, key, documentName: filename };
  }

  async getPresignedUrl(key: string, expiresIn = 604800): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn }
    );
  }

  // async downloadToFile(key: string, destPath: string): Promise<void> {
  //   const command = new GetObjectCommand({
  //     Bucket: this.bucket,
  //     Key: key,
  //   });
  //   const response = await this.client.send(command);
  //   if (!response.Body) throw new Error(`S3 object ${key} has no body`);
  //   // Pipe del stream de S3 al archivo local
  //   await streamPipeline(
  //     response.Body as NodeJS.ReadableStream,
  //     fs.createWriteStream(destPath)
  //   );
  // }
  async downloadToFile(key: string, destPath: string): Promise<void> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`S3 object ${key} has no body`);
    }

    return new Promise((resolve, reject) => {
      // Creamos el stream de escritura
      const fileStream = fs.createWriteStream(destPath);

      // Errores en cualquiera de los dos streams deben rechazarse
      fileStream.once("error", (err) => reject(err));
      (response.Body as NodeJS.ReadableStream).once("error", (err) =>
        reject(err)
      );

      // Cuando el WriteStream realmente se cierra, resolvemos la promesa
      fileStream.once("close", () => resolve());

      // Iniciamos el pipe
      (response.Body as NodeJS.ReadableStream).pipe(fileStream);
    });
  }
}
