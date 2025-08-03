import dotenv from "dotenv";
import { loadConfigDatabase } from "./infrastructure/database/mongo-connection";
import { createAuditLog } from "./infrastructure/repositories/audit-log.repository";
import {
  processDeleteContactsMessage,
  processDeleteMessage,
  processDeletePermanentlyMessage,
  processEmailMessage,
  processRestoreMessage,
  processToSignatureRecordMessage,
} from "./application/services/processor.service";

dotenv.config();

/**
 * AWS Lambda main handler for consuming Amazon MQ (RabbitMQ) messages.
 * AWS delivers an object in `event.rmqMessagesByQueue` where each key is "COLA::VHOST"
 * and the value is a Base64 array of messages.
 */
export const handler = async (event: any) => {
  // 1) DEBUG
  console.log("[DEBUG] Event completo:", JSON.stringify(event, null, 2));

  // 2) Connect to MongoDB
  try {
    await loadConfigDatabase();
  } catch (dbErr) {
    console.error("[Consumer] ⚠️ No se pudo conectar a MongoDB:", dbErr);
    // If you want to throw an error and stop processing, uncomment the next line:
    // throw dbErr;
  }

  const allQueues: Record<string, any[]> = event.rmqMessagesByQueue || {};
  let totalMessages = 0;

  // 4) Recorre cada cola del objeto
  for (const queueKey of Object.keys(allQueues)) {
    // queueKey es algo como "delete_documents_bulk::/"
    const messages = Array.isArray(allQueues[queueKey])
      ? allQueues[queueKey]
      : [];
    if (messages.length === 0) {
      continue;
    }

    console.log(
      `[Consumer] Cola="${queueKey}" → Mensajes en lote: ${messages.length}`
    );
    totalMessages += messages.length;

    // 5) Procesa cada mensaje
    for (const msg of messages) {
      const startTime = Date.now();
      // Declare variables for error handling scope
      let outerText: string | undefined = undefined;
      let outerObj: any = undefined;
      let innerMsg: any = undefined;
      let bodyText: string | undefined = undefined;
      try {
        // 5.a) msg.data viene en Base64; conviértelo a texto UTF-8
        const bufferOuter = Buffer.from(msg.data, "base64");
        outerText = bufferOuter.toString("utf8");
        console.log("[Consumer] Mensaje raw (decodificado):", outerText);

        // 5.b) outerText es un JSON con Records[]; parsea
        try {
          outerObj = JSON.parse(outerText);
        } catch (parseOuterError) {
          console.warn(
            "[Consumer] ⚠️ outerText no es JSON válido:",
            parseOuterError
          );
          throw parseOuterError;
        }

        // 5.c) Toma el first record
        const innerRecords: any[] = Array.isArray(outerObj.Records)
          ? outerObj.Records
          : [];
        if (innerRecords.length === 0) {
          console.warn(
            "[Consumer] ⚠️ outerObj.Records vacío, nada que procesar."
          );
          continue;
        }
        innerMsg = innerRecords[0]; // { messageId, deliveryTag, body, queueName }
        const bodyBase64 = innerMsg.body;
        console.log("[Consumer] Inner message body (Base64):", bodyBase64);

        // 5.d) Decodifica innerMsg.body (Base64) → bodyText final
        const bufferInner = Buffer.from(bodyBase64, "base64");
        bodyText = bufferInner.toString("utf8");
        console.log("[Consumer] Payload final (decodificado):", bodyText);

        // 5.e) Parsea el JSON final: { documentId, userId, timestamp }
        let parsedPayload: any;
        try {
          parsedPayload = JSON.parse(bodyText);
        } catch (parseInnerError) {
          console.warn(
            "[Consumer] ⚠️ bodyText no es JSON válido:",
            parseInnerError
          );
          throw parseInnerError;
        }

        switch (parsedPayload.action) {
          case "delete":
            console.log("[Consumer] Acción: Eliminar documento");
            await processDeleteMessage(parsedPayload);
            break;
          case "delete_permanently":
            console.log(
              "[Consumer] Acción: Eliminar documento permanentemente"
            );
            await processDeletePermanentlyMessage(parsedPayload);
            break;
          case "restore":
            console.log("[Consumer] Acción: Restaurar documento");
            await processRestoreMessage(parsedPayload);
            break;
          case "delete_contacts":
            console.log("[Consumer] Acción: Eliminar contactos");
            await processDeleteContactsMessage(parsedPayload);
            break;
          case "send_email":
            console.log("[Consumer] Acción: Enviar mail trasaccional");
            await processEmailMessage(parsedPayload);
            break;
          case "to_signature_record":
            console.log("[Consumer] Acción: Enviar a registro de firma");
            await processToSignatureRecordMessage(parsedPayload);
            break;
        }
        // 5.f) Llama a la lógica de negocio (processMessage) SIN canal, SIN deliveryTag

        console.log("[Consumer] Procesado OK →", parsedPayload);
      } catch (msgErr) {
        console.error(
          "[Consumer] 🔴 Error procesando mensaje (se reintentará el lote):",
          msgErr
        );
        // Aquí puedes agregar lógica para registrar el error en la base de datos
        const endTime = Date.now();
        const auditEntry: any = {
          timestamp: new Date(),
          method: "RABBITMQ - WARNING",
          path: queueKey,
          statusCode: 500,
          ip: "N/A",
          userAgent: "N/A",
          device: {
            os: "N/A",
            browser: "N/A",
            platform: "N/A",
            source: "lambda",
          },
          request: {
            headers: {},
            body: {
              outerText: typeof outerText !== "undefined" ? outerText : null,
              outerObj: typeof outerObj !== "undefined" ? outerObj : null,
              innerMsg: typeof innerMsg !== "undefined" ? innerMsg : null,
              bodyText: typeof bodyText !== "undefined" ? bodyText : null,
            },
            query: {},
            params: {},
          },
          response: {},
          durationMs:
            endTime - (typeof startTime !== "undefined" ? startTime : endTime),
          error: msgErr instanceof Error ? msgErr.stack : msgErr,
        };
        if (typeof createAuditLog === "function") {
          await createAuditLog(auditEntry);
        }

        // No lanzamos excepción, así el lote sigue procesando los siguientes mensajes
        continue;
      }
    }
  }

  console.log(`[Consumer] Total mensajes procesados: ${totalMessages}`);
  // Al finalizar sin excepción, AWS enviará el ACK a RabbitMQ por cada mensaje.
  return { status: "OK", processed: totalMessages };
};
