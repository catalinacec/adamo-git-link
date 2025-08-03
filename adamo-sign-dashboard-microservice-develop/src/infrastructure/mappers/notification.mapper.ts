// src/infrastructure/mappers/notification.mapper.ts
import { Notification } from "../../domain/models/notification.entity";
import { INotificationDoc } from "../repositories/notification.repository";

// Documento → Entidad
export function toDomain(doc: INotificationDoc): Notification {
  return new Notification(doc.user, doc.read, doc.isActive);
}

// Entidad parcial → Persistencia
export function toPersistence(
  input: Partial<Notification>
): Partial<INotificationDoc> {
  return {
    user: input.user!,
    read: input.read ?? false,
    isActive: input.isActive ?? true,
  };
}
