// src/infrastructure/mappers/notification.mapper.ts
import { Notification } from "../../domain/models/notification.entity";
import { INotificationDoc } from "../repositories/notification.repository";

// Documento → Entidad
export function toDomain(doc: INotificationDoc): Notification {
  return new Notification(
    doc.user,
    doc.type,
    doc.data ?? null,
    doc.read,
    doc.isActive,
    doc.createdAt,
    doc._id?.toString()
  );
}

// Entidad parcial → Persistencia
export function toPersistence(
  input: Partial<Notification>
): Partial<INotificationDoc> {
  return {
    user: input.user!,
    type: input.type!,
    data: input.data ?? null,
    read: input.read ?? false,
    isActive: input.isActive ?? true,
    createdAt: input.createdAt ?? new Date(),
  };
}
