import mongoose, { Schema, Document, Types } from "mongoose";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

import {
  Notification,
  NotificationData,
} from "../../domain/models/notification.entity";
import {
  toDomain,
  toPersistence,
} from "../middlewares/mappers/notification.mapper";

export interface INotificationDoc extends Document {
  _id: Types.ObjectId;
  user: string;
  type: string;
  data: NotificationData | null;
  read: boolean;
  isActive: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    user: { type: String, required: true, index: true },
    type: { type: String, required: true },
    data: {
      title: { type: String, required: true },
      message: { type: String, required: true },
      metadata: { type: Schema.Types.Mixed },
    },
    read: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const NotificationModel = mongoose.model<INotificationDoc>(
  "Notification",
  NotificationSchema
);

export class NotificationRepository implements INotificationRepository {
  async create(data: Partial<Notification>): Promise<Notification> {
    const payload = toPersistence(data);
    const doc = await NotificationModel.create(payload);
    return toDomain(doc);
  }
}
