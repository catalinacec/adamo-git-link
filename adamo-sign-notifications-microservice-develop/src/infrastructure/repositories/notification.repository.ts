import mongoose, { Schema, Document, Types } from "mongoose";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { toDomain, toPersistence } from "../mappers/notification.mapper";
import {
  Notification,
  NotificationData,
} from "../../domain/models/notification.entity";

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
      metadata: {
        documentId: { type: String },
        blockchainHash: { type: String },
        sender: { type: String },
        recipient: { type: String },
      },
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
  // async findByUser(userId: string): Promise<Notification[]> {
  //   const docs = await NotificationModel.find({ user: userId }).exec();
  //   return docs.map(toDomain);
  // }
  async findByUser(
    userId: string,
    userUUID?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: Notification[]; total: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const skip = (page - 1) * limit;

    const userFilter = userUUID
      ? { $or: [{ user: userId }, { user: userUUID }] }
      : { user: userId };

    const dateFilter = { createdAt: { $gte: thirtyDaysAgo } };

    const filter = { ...userFilter, ...dateFilter };

    const [docs, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      NotificationModel.countDocuments({
        user: userId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    return {
      notifications: docs.map(toDomain),
      total,
    };
  }

  async markAsRead(id: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(id, { read: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const payload = toPersistence(data);
    const doc = await NotificationModel.create(payload);
    return toDomain(doc);
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id).exec();
    return doc ? toDomain(doc) : null;
  }

  async findByIdOrUUID(
    id: string,
    userId: string,
    userUUID: string
  ): Promise<Notification | null> {
    const doc = await NotificationModel.findOne({
      $and: [{ _id: id }, { $or: [{ user: userId }, { user: userUUID }] }],
    }).exec();
    return doc ? toDomain(doc) : null;
  }

  async countUnreadByUser(userId: string, userUUID?: string): Promise<number> {
    const userFilter = userUUID
      ? { $or: [{ user: userId }, { user: userUUID }] }
      : { user: userId };
    const filter = {
      ...userFilter,
      read: false,
      isActive: true,
    };

    const count = await NotificationModel.countDocuments(filter).exec();
    return count;
  }
}
