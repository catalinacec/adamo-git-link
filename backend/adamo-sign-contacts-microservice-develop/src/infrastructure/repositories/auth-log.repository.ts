import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  device: {
    os: string;
    browser: string;
    platform: string;
    source: string;
  };
  request: {
    headers: any;
    body: any;
    query: any;
    params: any;
  };
  response: any;
  durationMs: number;
  error?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: { type: Date, default: Date.now },
    method: String,
    path: String,
    statusCode: Number,
    ip: String,
    userAgent: String,
    device: {
      os: String,
      browser: String,
      platform: String,
      source: String,
    },
    request: {
      headers: Schema.Types.Mixed,
      body: Schema.Types.Mixed,
      query: Schema.Types.Mixed,
      params: Schema.Types.Mixed,
    },
    response: Schema.Types.Mixed,
    durationMs: Number,
    error: String,
  },
  { timestamps: false }
);

export const AuditLogModel = mongoose.model<IAuditLog>(
  "AuditLog",
  AuditLogSchema
);
