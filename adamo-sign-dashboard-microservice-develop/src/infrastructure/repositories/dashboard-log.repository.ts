import mongoose, { Schema, Document } from "mongoose";
import { WelcomeData } from "../../domain/models/dashboard-metrics.entity";
import { IDashboardLogRepository } from "../../domain/repositories/IDashboardLogRepository";

export interface IDashboardLog extends Document {
  timestamp: Date;
  statusCode: number;
  user: string;
  response: any;
}

const DashboardLogSchema = new Schema<IDashboardLog>(
  {
    timestamp: { type: Date, default: Date.now },
    statusCode: { type: Number, required: true },
    user: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: false }
);

export const DashboardLogModel = mongoose.model<IDashboardLog>(
  "DashboardLog",
  DashboardLogSchema
);

export class DashboardLogRepository implements IDashboardLogRepository {
  async registerWelcomeActivity(
    userId: string,
    data: WelcomeData
  ): Promise<any> {
    const log = new DashboardLogModel({
      statusCode: 200,
      user: userId,
      response: data,
    });
    return await log.save();
  }
}
