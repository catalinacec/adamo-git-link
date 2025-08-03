import {
  AuditLogModel,
  IAuditLog,
} from "../../infrastructure/repositories/auth-log.repository";

export class AuditLoggerService {
  static async log(data: Partial<IAuditLog>) {
    try {
      await AuditLogModel.create(data);
    } catch (error) {
      console.error("❌ Error al guardar log de auditoría:", error);
    }
  }
}
