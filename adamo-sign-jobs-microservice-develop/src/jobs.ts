import dotenv from "dotenv";
import { loadConfigDatabase } from "./infrastructure/database/mongo-connection";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DocumentModel } from "./infrastructure/repositories/document.repository";

dotenv.config();

// Cliente S3 (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export const handler = async (event: any) => {
  console.log("[DEBUG] Event completo:", JSON.stringify(event, null, 2));

  // 1) Conectar a MongoDB
  let db;
  try {
    db = await loadConfigDatabase();
    console.log("[DEBUG] Conectado a MongoDB");
  } catch (dbErr) {
    console.error("[ERROR] No se pudo conectar a MongoDB:", dbErr);
    return { status: "ERROR_CONNECTING_DB" };
  }

  // 2) Calcular fecha límite (hace 30 días)
  const cutoff = new Date(Date.now());

  // 3) Buscar documentos soft-deleted (>30 días)
  const toPurge = await DocumentModel.find({
    isDeleted: true,
    updatedAt: { $lt: cutoff },
  }).limit(1).exec();

  console.log(`[INFO] Documentos a purgar: ${toPurge.length}`);

  // 4) Para cada uno: borrar de S3 y eliminar de Mongo
  for (const doc of toPurge) {
    const key = doc.metadata.s3Key;
    try {
      // 4.1) Borrar objeto en S3
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
        })
      );
      console.log(`✅ Borrado S3: ${key}`);

      // 4.2) Eliminar el documento de la colección
      //await DocumentModel.deleteOne({ _id: doc._id }).exec();
      console.log(`🗑️ Eliminado de Mongo: ${doc._id}`);
    } catch (err) {
      console.error(`❌ Error purgando ${key}:`, err);
    }
  }

  return { status: "OK", purged: toPurge.length };
};
