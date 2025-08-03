import mongoose, { Schema, Document, Types } from "mongoose";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export interface INotificationDoc extends Document {
  _id: Types.ObjectId;
  user: string;
  read: boolean;
  isActive: boolean;
}

const NotificationSchema = new Schema<INotificationDoc>({
  user: { type: String, required: true, index: true },
  read: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
});

export const NotificationModel = mongoose.model<INotificationDoc>(
  "Notification",
  NotificationSchema
);

export class NotificationRepository implements INotificationRepository {
  async countUnreadByUser(userId: string): Promise<number> {
    const count = await NotificationModel.countDocuments({
      user: userId,
      read: false,
      isActive: true,
    });
    return count;
  }
}
