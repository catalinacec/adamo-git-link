import { DocumentsRepository } from "../../infrastructure/repositories/document.repository";
import { createAuditLog } from "../../infrastructure/repositories/audit-log.repository";
import { EDocumentStatus } from "../../domain/models/document.entity";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository";
import { sendCompletedDocumentEmail, sendGeneralEmail } from "./email.service";
import { ContactRepository } from "../../infrastructure/repositories/contacts.repository";
import { PdfSignService } from "./pdfSign.service";
import { S3Service } from "./s3.service";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { getI18n } from "../../i18n/i18n";

interface IncomingMessage {
  documentId: string;
  userId: string;
  timestamp: number | string;
  // Transactional email parameters
  dataEmail?: {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    content?: any;
  };
}

export async function processDeleteMessage(
  parsedData: IncomingMessage
): Promise<void> {
  const repoDoc = new DocumentsRepository();

  console.log("[processMessage] Inicio procesamiento del mensaje:", parsedData);
  // Vars for audit log
  const startTime = Date.now();
  const auditEntry: any = {
    timestamp: new Date(),
    method: "RABBITMQ",
    path: "delete_documents_bulk",
    statusCode: 200,
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
      body: parsedData,
      query: {},
      params: {},
    },
    response: {},
    durationMs: 0,
    error: undefined,
  };
  console.log("[processMessage] Datos auditoria :", { startTime, auditEntry });

  try {
    // ************ 1) Validar formato del mensaje ************
    console.log("[processMessage] Validando datos del mensaje...");
    const msg = parsedData as IncomingMessage;
    if (!msg.documentId || !msg.userId) {
      throw new Error("Payload inválido: faltan documentId o userId");
    }
    console.log("[processMessage] Datos recibidos:", msg);

    // ************ 2) Buscar documento por documentId ************
    console.log(`[processMessage] Search document - ID:   ${msg.documentId}`);
    const document = await repoDoc.findLatestVersionByDocId(msg.documentId);
    if (!document) {
      throw new Error(`Documento con ID ${msg.documentId} no encontrado`);
    }
    console.log(`Document status - ${document.status} - ${document.filename}`);

    // ************ 3) Si el documento está en DRAFT, borrado lógicamente ************
    if (document.status === EDocumentStatus.DRAFT) {
      await repoDoc.softDeleteDocument(msg.documentId, msg.userId);
      console.log(
        `[processMessage] Documento ${msg.documentId} marcado como DELETED`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: true,
      };

      try {
        // Crear la notificación en la base de datos
        const notification = {
          user: document.owner, // o el campo correcto según tu modelo
          type: "document_recycler",
          title: "Documento enviado a la papelera",
          message: `El documento "${document.filename}" fue enviado a la papelera correctamente.`,
          data: {
            documentId: msg.documentId,
            filename: document.filename,
            title: "Documento eliminado",
            message: `El documento "${document.filename}" fue enviado a la papelera correctamente.`,
          },
          createdAt: new Date(),
          read: false,
        };

        const notificationRepo = new NotificationRepository();
        const createdNotification = await notificationRepo.create(notification);

        console.log(
          "[processMessage] Notificación creada y enviada:",
          createdNotification
        );
      } catch (notifyErr) {
        console.error(
          "[processMessage] Error creando/enviando notificación:",
          notifyErr
        );
        // No abortamos el flujo si falla la notificación, solo lo registramos.
      }
    }

    if (document.status === EDocumentStatus.RECYCLER) {
      await repoDoc.softDeletePermanentlyDocument(msg.documentId, msg.userId);
      console.log(
        `[processMessage] Documento ${msg.documentId} marcado como DELETED`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: true,
      };

      try {
        // Crear la notificación en la base de datos
        const notification = {
          user: document.owner, // o el campo correcto según tu modelo
          type: "document_deleted",
          title: "Documento eliminado",
          message: `El documento "${document.filename}" fue eliminado correctamente.`,
          data: {
            documentId: msg.documentId,
            filename: document.filename,
            title: "Documento eliminado",
            message: `El documento "${document.filename}" fue eliminado correctamente.`,
          },
          createdAt: new Date(),
          read: false,
        };

        const notificationRepo = new NotificationRepository();
        const createdNotification = await notificationRepo.create(notification);

        console.log(
          "[processMessage] Notificación creada y enviada:",
          createdNotification
        );
      } catch (notifyErr) {
        console.error(
          "[processMessage] Error creando/enviando notificación:",
          notifyErr
        );
        // No abortamos el flujo si falla la notificación, solo lo registramos.
      }
    } else {
      console.log(
        `[processMessage] Document ${msg.documentId} no se encontraba en DRAFT o RECYCLER → no se borra`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: false,
        reason: "no estaba en DRAFT",
      };
    }

    // ************ 4) Registrar auditoría “exitoso” ************
    auditEntry.statusCode = 200;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error("[processMessage] Error guardando audit log:", auditErr);
      // No abortamos el flujo si falla la auditoría, solo lo registramos.
    }

    // ************ 5) Si llegamos aquí, todo salió bien ************
    return;
  } catch (err: any) {
    console.error("[processMessage] Error procesando el mensaje:", err);

    // 5b) Registrar auditoría “fallo”
    auditEntry.statusCode = 500;
    auditEntry.response = { error: err.message };
    auditEntry.error = err.stack || err.message;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error(
        "[processMessage] Error guardando audit log de fallo:",
        auditErr
      );
    }

    try {
      // Crear la notificación de error en la base de datos
      const notification = {
        user: parsedData.userId, // o el campo correcto según tu modelo
        type: "error",
        title: "Error al eliminar documento",
        message: `No se pudo eliminar el documento con ID "${parsedData.documentId}".`,
        data: {
          documentId: parsedData.documentId,
          title: "Error al eliminar documento",
          message: `No se pudo eliminar el documento con ID "${parsedData.documentId}".`,
          error: err.message,
        },
        createdAt: new Date(),
        read: false,
      };

      const notificationRepo = new NotificationRepository();
      const createdNotification = await notificationRepo.create(notification);

      console.log(
        "[processMessage] Notificación de error creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación de error:",
        notifyErr
      );
      // No abortamos el flujo si falla la notificación, solo lo registramos.
    }
    // ************ 6) Lanzar la excepción para que el handler marque el batch como “failure” ************
    throw err;
  }
}

export async function processDeletePermanentlyMessage(
  parsedData: IncomingMessage
): Promise<void> {
  const repoDoc = new DocumentsRepository();

  console.log("[processMessage] Inicio procesamiento del mensaje:", parsedData);
  // Vars for audit log
  const startTime = Date.now();
  const auditEntry: any = {
    timestamp: new Date(),
    method: "RABBITMQ",
    path: "delete_permanently_documents_bulk",
    statusCode: 200,
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
      body: parsedData,
      query: {},
      params: {},
    },
    response: {},
    durationMs: 0,
    error: undefined,
  };
  console.log("[processMessage] Datos auditoria :", { startTime, auditEntry });

  try {
    // ************ 1) Validar formato del mensaje ************
    console.log("[processMessage] Validando datos del mensaje...");
    const msg = parsedData as IncomingMessage;
    if (!msg.documentId || !msg.userId) {
      throw new Error("Payload inválido: faltan documentId o userId");
    }
    console.log("[processMessage] Datos recibidos:", msg);

    // ************ 2) Buscar documento por documentId ************
    console.log(`[processMessage] Search document - ID:   ${msg.documentId}`);
    const document = await repoDoc.findLatestVersionByDocIdAndOwner(
      msg.documentId,
      msg.userId
    );
    if (!document) {
      throw new Error(`Documento con ID ${msg.documentId} no encontrado`);
    }
    console.log(`Document status - ${document.status} - ${document.filename}`);

    // ************ 3) Si el documento está en DRAFT, borrado lógicamente ************
    if (
      document.status === EDocumentStatus.DRAFT ||
      document.status === EDocumentStatus.REJECTED ||
      document.status === EDocumentStatus.DELETED ||
      document.status === EDocumentStatus.RECYCLER
    ) {
      await repoDoc.softDeletePermanentlyDocument(msg.documentId, msg.userId);
      console.log(
        `[processMessage] Documento ${msg.documentId} marcado como DELETED`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: true,
      };

      try {
        // Crear la notificación en la base de datos
        const notification = {
          user: document.owner, // o el campo correcto según tu modelo
          type: "document_deleted_permanently",
          title: "Documento eliminado permanentemente",
          message: `El documento "${document.filename}" fue eliminado permanentemente de manera correcta.`,
          data: {
            documentId: msg.documentId,
            filename: document.filename,
            title: "Documento eliminado permanentemente",
            message: `El documento "${document.filename}" fue eliminado permanentemente de manera correcta.`,
          },
          createdAt: new Date(),
          read: false,
        };

        const notificationRepo = new NotificationRepository();
        const createdNotification = await notificationRepo.create(notification);

        console.log(
          "[processMessage] Notificación creada y enviada:",
          createdNotification
        );
      } catch (notifyErr) {
        console.error(
          "[processMessage] Error creando/enviando notificación:",
          notifyErr
        );
        // No abortamos el flujo si falla la notificación, solo lo registramos.
      }
    } else {
      console.log(
        `[processMessage] Document ${msg.documentId} → no se puede borrar permanentemente`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: false,
        reason: "no estaba en status DRAFT, REJECTED, DELETED or RECYCLER",
      };
    }

    // ************ 4) Registrar auditoría “exitoso” ************
    auditEntry.statusCode = 200;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error("[processMessage] Error guardando audit log:", auditErr);
      // No abortamos el flujo si falla la auditoría, solo lo registramos.
    }

    // ************ 5) Si llegamos aquí, todo salió bien ************
    return;
  } catch (err: any) {
    console.error("[processMessage] Error procesando el mensaje:", err);

    // 5b) Registrar auditoría “fallo”
    auditEntry.statusCode = 500;
    auditEntry.response = { error: err.message };
    auditEntry.error = err.stack || err.message;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error(
        "[processMessage] Error guardando audit log de fallo:",
        auditErr
      );
    }

    try {
      // Crear la notificación de error en la base de datos
      const notification = {
        user: parsedData.userId, // o el campo correcto según tu modelo
        type: "error",
        title: "Error al eliminar documento permanentemente",
        message: `No se pudo eliminar el documento permanentemente con ID "${parsedData.documentId}".`,
        data: {
          documentId: parsedData.documentId,
          title: "Error al eliminar documento permanentemente",
          message: `No se pudo eliminar el documento permanentemente con ID "${parsedData.documentId}".`,
          error: err.message,
        },
        createdAt: new Date(),
        read: false,
      };

      const notificationRepo = new NotificationRepository();
      const createdNotification = await notificationRepo.create(notification);

      console.log(
        "[processMessage] Notificación de error creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación de error:",
        notifyErr
      );
      // No abortamos el flujo si falla la notificación, solo lo registramos.
    }
    // ************ 6) Lanzar la excepción para que el handler marque el batch como “failure” ************
    throw err;
  }
}

export async function processRestoreMessage(
  parsedData: IncomingMessage
): Promise<void> {
  const repoDoc = new DocumentsRepository();

  console.log("[processMessage] Inicio procesamiento del mensaje:", parsedData);
  // Vars for audit log
  const startTime = Date.now();
  const auditEntry: any = {
    timestamp: new Date(),
    method: "RABBITMQ",
    path: "delete_documents_bulk",
    statusCode: 200,
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
      body: parsedData,
      query: {},
      params: {},
    },
    response: {},
    durationMs: 0,
    error: undefined,
  };
  console.log("[processMessage] Datos auditoria :", { startTime, auditEntry });

  try {
    // ************ 1) Validar formato del mensaje ************
    console.log("[processMessage] Validando datos del mensaje...");
    const msg = parsedData as IncomingMessage;
    if (!msg.documentId || !msg.userId) {
      throw new Error("Payload inválido: faltan documentId o userId");
    }
    console.log("[processMessage] Datos recibidos:", msg);

    // ************ 2) Buscar documento por documentId ************
    console.log(`[processMessage] Search document - ID:   ${msg.documentId}`);
    const document = await repoDoc.findLatestVersionByDocId(msg.documentId);
    if (!document) {
      throw new Error(`Documento con ID ${msg.documentId} no encontrado`);
    }
    console.log(`Document status - ${document.status} - ${document.filename}`);

    if (document.status == EDocumentStatus.DELETED) {
      throw new Error(
        `El documento con ID ${msg.documentId} fue eliminado previamente. No se puede restaurar.`
      );
    }

    // ************ 3) Si el documento está en DRAFT, borrado lógicamente ************
    if (document.status === EDocumentStatus.DRAFT) {
      await repoDoc.softRestoreDocument(msg.documentId, msg.userId);
      console.log(
        `[processMessage] Documento ${msg.documentId} marcado como DELETED`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: true,
      };

      try {
        // Crear la notificación en la base de datos
        const notification = {
          user: document.owner, // o el campo correcto según tu modelo
          type: "document_deleted",
          title: "Documento eliminado",
          message: `El documento "${document.filename}" fue eliminado correctamente.`,
          data: {
            documentId: msg.documentId,
            filename: document.filename,
            title: "Documento eliminado",
            message: `El documento "${document.filename}" fue eliminado correctamente.`,
          },
          createdAt: new Date(),
          read: false,
        };

        const notificationRepo = new NotificationRepository();
        const createdNotification = await notificationRepo.create(notification);

        console.log(
          "[processMessage] Notificación creada y enviada:",
          createdNotification
        );
      } catch (notifyErr) {
        console.error(
          "[processMessage] Error creando/enviando notificación:",
          notifyErr
        );
        // No abortamos el flujo si falla la notificación, solo lo registramos.
      }
    } else {
      console.log(
        `[processMessage] Document ${msg.documentId} no DRAFT → no se borra`
      );
      auditEntry.response = {
        documentId: msg.documentId,
        deleted: false,
        reason: "no estaba en DRAFT",
      };
    }

    // ************ 4) Registrar auditoría “exitoso” ************
    auditEntry.statusCode = 200;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error("[processMessage] Error guardando audit log:", auditErr);
      // No abortamos el flujo si falla la auditoría, solo lo registramos.
    }

    // ************ 5) Si llegamos aquí, todo salió bien ************
    return;
  } catch (err: any) {
    console.error("[processMessage] Error procesando el mensaje:", err);

    // 5b) Registrar auditoría “fallo”
    auditEntry.statusCode = 500;
    auditEntry.response = { error: err.message };
    auditEntry.error = err.stack || err.message;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error(
        "[processMessage] Error guardando audit log de fallo:",
        auditErr
      );
    }

    try {
      // Crear la notificación de error en la base de datos
      const notification = {
        user: parsedData.userId, // o el campo correcto según tu modelo
        type: "error",
        title: "Error al eliminar documento",
        message: `No se pudo eliminar el documento con ID "${parsedData.documentId}".`,
        data: {
          documentId: parsedData.documentId,
          title: "Error al eliminar documento",
          message: `No se pudo eliminar el documento con ID "${parsedData.documentId}".`,
          error: err.message,
        },
        createdAt: new Date(),
        read: false,
      };

      const notificationRepo = new NotificationRepository();
      const createdNotification = await notificationRepo.create(notification);

      console.log(
        "[processMessage] Notificación de error creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación de error:",
        notifyErr
      );
      // No abortamos el flujo si falla la notificación, solo lo registramos.
    }
    // ************ 6) Lanzar la excepción para que el handler marque el batch como “failure” ************
    throw err;
  }
}

export async function processEmailMessage(
  parsedData: IncomingMessage
): Promise<void> {
  const repoDoc = new DocumentsRepository();

  console.log("[processMessage] Inicio procesamiento del mensaje:", parsedData);
  // Vars for audit log
  const startTime = Date.now();
  const auditEntry: any = {
    timestamp: new Date(),
    method: "RABBITMQ",
    path: "delete_documents_bulk",
    statusCode: 200,
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
      body: parsedData,
      query: {},
      params: {},
    },
    response: {},
    durationMs: 0,
    error: undefined,
  };
  console.log("[processMessage] Datos auditoria :", { startTime, auditEntry });

  try {
    // ************ 1) Validar formato del mensaje ************
    console.log("[processMessage] Validando datos del mensaje...");
    const msg = parsedData as IncomingMessage;
    if (
      !msg.dataEmail ||
      !msg.dataEmail.from ||
      !msg.dataEmail.to ||
      !msg.dataEmail.subject ||
      !msg.dataEmail.text ||
      !msg.dataEmail.content
    ) {
      throw new Error("Payload inválido: faltan parametros");
    }
    console.log("[processMessage] Datos recibidos:", msg);

    await sendGeneralEmail(
      msg.dataEmail.from,
      msg.dataEmail.to,
      msg.dataEmail.subject,
      msg.dataEmail.text,
      msg.dataEmail.content
    );

    // ************ 4) Registrar auditoría “exitoso” ************
    auditEntry.statusCode = 200;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error("[processMessage] Error guardando audit log:", auditErr);
      // No abortamos el flujo si falla la auditoría, solo lo registramos.
    }

    // ************ 5) Si llegamos aquí, todo salió bien ************
    return;
  } catch (err: any) {
    console.error("[processMessage] Error procesando el mensaje:", err);

    // 5b) Registrar auditoría “fallo”
    auditEntry.statusCode = 500;
    auditEntry.response = { error: err.message };
    auditEntry.error = err.stack || err.message;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error(
        "[processMessage] Error guardando audit log de fallo:",
        auditErr
      );
    }

    throw err;
  }
}

export async function processDeleteContactsMessage(
  parsedData: IncomingMessage
): Promise<void> {
  const repoContact = new ContactRepository();

  console.log("[processMessage] Inicio procesamiento del mensaje:", parsedData);
  // Vars for audit log
  const startTime = Date.now();
  const auditEntry: any = {
    timestamp: new Date(),
    method: "RABBITMQ",
    path: "delete_documents_bulk",
    statusCode: 200,
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
      body: parsedData,
      query: {},
      params: {},
    },
    response: {},
    durationMs: 0,
    error: undefined,
  };
  console.log("[processMessage] Datos auditoria :", { startTime, auditEntry });

  try {
    // ************ 1) Validar formato del mensaje ************
    console.log("[processMessage] Validando datos del mensaje...");
    const msg = parsedData as IncomingMessage;
    if (!msg.documentId || !msg.userId) {
      throw new Error("Payload inválido: faltan contactId o userId");
    }
    console.log("[processMessage] Datos recibidos:", msg);

    const contact = await repoContact.delete(msg.documentId, msg.userId);
    if (!contact) {
      throw new Error(
        `Contacto con ID ${msg.documentId} no encontrado o no pertenece al usuario`
      );
    }
    console.log(
      `[processMessage] Contacto ${msg.documentId} marcado como inactivo`
    );
    auditEntry.response = {
      contactId: msg.documentId,
      deleted: true,
    };
    try {
      const notification = {
        user: msg.userId,
        type: "contact_deleted",
        title: "Contacto eliminado",
        message: `El contacto con ID "${msg.documentId}" fue eliminado correctamente.`,
        data: {
          contactId: msg.documentId,
          title: "Contacto eliminado",
          message: `El contacto con ID "${msg.documentId}" fue eliminado correctamente.`,
        },
        createdAt: new Date(),
        read: false,
      };
      const notificationRepo = new NotificationRepository();
      const createdNotification = await notificationRepo.create(notification);
      console.log(
        "[processMessage] Notificación creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación:",
        notifyErr
      );
    }
    // ************ 4) Registrar auditoría “exitoso” ************
    auditEntry.statusCode = 200;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error("[processMessage] Error guardando audit log:", auditErr);
      // No abortamos el flujo si falla la auditoría, solo lo registramos.
    }

    // ************ 5) Si llegamos aquí, todo salió bien ************
    return;
  } catch (err: any) {
    console.error("[processMessage] Error procesando el mensaje:", err);

    // 5b) Registrar auditoría “fallo”
    auditEntry.statusCode = 500;
    auditEntry.response = { error: err.message };
    auditEntry.error = err.stack || err.message;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error(
        "[processMessage] Error guardando audit log de fallo:",
        auditErr
      );
    }

    try {
      // Crear la notificación de error en la base de datos
      const notification = {
        user: parsedData.userId, // o el campo correcto según tu modelo
        type: "error",
        title: "Error al eliminar contacto",
        message: `No se pudo eliminar el contacto con ID "${parsedData.documentId}".`,
        data: {
          contactId: parsedData.documentId,
          title: "Error al eliminar contacto",
          message: `No se pudo eliminar el contacto con ID "${parsedData.documentId}".`,
          error: err.message,
        },
        createdAt: new Date(),
        read: false,
      };

      const notificationRepo = new NotificationRepository();
      const createdNotification = await notificationRepo.create(notification);

      console.log(
        "[processMessage] Notificación de error creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación de error:",
        notifyErr
      );
      // No abortamos el flujo si falla la notificación, solo lo registramos.
    }
    // ************ 6) Lanzar la excepción para que el handler marque el batch como “failure” ************
    throw err;
  }
}

export async function processToSignatureRecordMessage(
  parsedData: IncomingMessage
): Promise<void> {
  const repoDoc = new DocumentsRepository();
  const userRepo = new UserRepository();
  const s3 = new S3Service();
  const pdfSigner = new PdfSignService(s3);

  console.log("[processMessage] Inicio procesamiento del mensaje:", parsedData);
  // Vars for audit log
  const startTime = Date.now();
  const auditEntry: any = {
    timestamp: new Date(),
    method: "SIGNATURE_RECORD",
    path: "to_signature_record",
    statusCode: 200,
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
      body: parsedData,
      query: {},
      params: {},
    },
    response: {},
    durationMs: 0,
    error: undefined,
  };
  console.log("[processMessage] Datos auditoria :", { startTime, auditEntry });

  try {
    // ************ 1) Validar formato del mensaje ************
    console.log("[processMessage] Validando datos del mensaje...");
    const msg = parsedData as IncomingMessage;
    if (!msg.documentId) {
      throw new Error("Payload inválido: faltan documentId");
    }
    console.log("[processMessage] Datos recibidos:", msg);

    /**
     * ******************************************************************
     * ******************************************************************
     */
    const document = await repoDoc.findLatestVersionByDocId(msg.documentId);

    if (!document) {
      throw new Error(`Documento con ID ${msg.documentId} no encontrado`);
    }

    let hashFinalPDF = "";
    const s3FinalKey =
      document.metadata.versions[document.metadata.versions.length - 1]
        .filename;
    // Se firma con el hash todo el documento
    const { hashSignedUrl, hashS3Key, hashDocName, hashDocument } =
      await pdfSigner.signHashPdf(document, s3FinalKey);

    hashFinalPDF = hashDocument;

    await repoDoc.addDocumentVersionMetadata(
      document.documentId,
      hashSignedUrl,
      hashS3Key,
      hashDocName,
      ""
    );

    const prefinalDocument = await repoDoc.findLatestVersionByDocId(
      document.documentId
    );

    if (prefinalDocument === null) {
      throw new Error("Documento no encontrado");
    }

    // Se prepara y agrega  el acta de firmas
    const { fSignedUrl, fS3Key, fDocName, hash } =
      await pdfSigner.addSignatureRecordPDf(
        prefinalDocument,
        hashS3Key,
        hashFinalPDF
      );

    await repoDoc.updateDocumentStatus(
      msg.documentId,
      EDocumentStatus.COMPLETED
    );

    await repoDoc.addDocumentVersionMetadata(
      document.documentId,
      fSignedUrl,
      fS3Key,
      fDocName,
      hashFinalPDF
    );

    console.log("Signed Hash PDF URL:", {
      fSignedUrl,
      fS3Key,
      fDocName,
      hash,
    });

    const finalRecordDocument = await repoDoc.findLatestVersionByDocId(
      document.documentId
    );

    if (finalRecordDocument === null) {
      throw new Error("Documento final no encontrado");
    }

    const userOwner = await userRepo.findByOwnerId(finalRecordDocument.owner);

    const language = userOwner?.language ?? "en";
    const t = getI18n(language);
    const participants = finalRecordDocument.participants.map(
      (p) => `${p.first_name} ${p.last_name}`
    );
    const documentLink =
      finalRecordDocument.metadata.versions[
        finalRecordDocument.metadata.versions.length - 1
      ].url ?? "";

    console.log("[processMessage] Enviando email de documento completado...");
    for (let i = 0; i < participants.length; i++) {
      await sendCompletedDocumentEmail(
        finalRecordDocument.participants[i].email ?? "", // email
        finalRecordDocument.participants[i].first_name ?? "", // name
        participants, //signers
        documentLink, // document_link
        finalRecordDocument.filename || "Documento", //document_name
        t //i18n
      );
    }
    console.log(
      "[processMessage] Email de documento completado enviado correctamente"
    );

    // await sendSignDocumentConfirmEmail(
    //   emailOwner?.email || "",
    //   {
    //     documentId: preDocument.documentId,
    //     documentName: preDocument.filename || "Documento",
    //     contractId: preDocument.blockchain?.contractId || "",
    //     transactionId: preDocument.blockchain?.transactionId || "",
    //     network: this.blockchainService.network || "default-network",
    //     registeredAt: preDocument.blockchain?.registeredAt || new Date(),
    //     hash: hashFinalPDF,
    //   },
    //   t
    // );
    /**
     * ******************************************************************
     * ******************************************************************
     */

    auditEntry.response = {
      documentId: msg.documentId,
      pdfUrl: fSignedUrl,
      completed: true,
    };
    try {
      console.log("[processMessage] Creando notificación de éxito...");
      // Crear la notificación en la base
      const notification = {
        user: document.owner,
        type: "signature_record_created",
        title: "Documento completado",
        message: `El documento fue completado y se registró el acta de firmas correctamente.`,
        data: {
          enabledRead: true,
          typeRead: "completed_document",
          documentId: msg.documentId,
          completed: true,
          documentName: document.filename || "Documento",
          title: "Documento completado",
          message: `El documento con ID "${msg.documentId}" fue completado y se registró el acta de firmas correctamente. URL PDF: ${fSignedUrl}`,
          link: fSignedUrl,
        },
        createdAt: new Date(),
        read: false,
      };
      console.log("[processMessage] Notificación a crear:", notification);
      const notificationRepo = new NotificationRepository();
      console.log("[processMessage] Enviando notificación...");
      const createdNotification = await notificationRepo.create(notification);
      console.log(
        "[processMessage] Notificación creada y enviada:",
        createdNotification
      );
      console.log(
        "[processMessage] Notificación creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación:",
        notifyErr
      );
    }
    // ************ 4) Registrar auditoría “exitoso” ************
    auditEntry.statusCode = 200;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error("[processMessage] Error guardando audit log:", auditErr);
      // No abortamos el flujo si falla la auditoría, solo lo registramos.
    }

    // ************ 5) Si llegamos aquí, todo salió bien ************
    return;
  } catch (err: any) {
    console.error("[processMessage] Error procesando el mensaje:", err);

    // 5b) Registrar auditoría “fallo”
    auditEntry.statusCode = 500;
    auditEntry.response = { error: err.message };
    auditEntry.error = err.stack || err.message;
    auditEntry.durationMs = Date.now() - startTime;
    try {
      await createAuditLog(auditEntry);
    } catch (auditErr) {
      console.error(
        "[processMessage] Error guardando audit log de fallo:",
        auditErr
      );
    }

    try {
      // Crear la notificación de error en la base de datos
      const notification = {
        user: parsedData.userId, // o el campo correcto según tu modelo
        type: "error",
        title: "Error al eliminar contacto",
        message: `No se pudo eliminar el contacto con ID "${parsedData.documentId}".`,
        data: {
          contactId: parsedData.documentId,
          title: "Error al eliminar contacto",
          message: `No se pudo eliminar el contacto con ID "${parsedData.documentId}".`,
          error: err.message,
        },
        createdAt: new Date(),
        read: false,
      };

      const notificationRepo = new NotificationRepository();
      const createdNotification = await notificationRepo.create(notification);

      console.log(
        "[processMessage] Notificación de error creada y enviada:",
        createdNotification
      );
    } catch (notifyErr) {
      console.error(
        "[processMessage] Error creando/enviando notificación de error:",
        notifyErr
      );
      // No abortamos el flujo si falla la notificación, solo lo registramos.
    }
    // ************ 6) Lanzar la excepción para que el handler marque el batch como “failure” ************
    throw err;
  }
}
