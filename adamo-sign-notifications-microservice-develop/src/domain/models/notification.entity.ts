// src/domain/models/notification.entity.ts
export class Notification {
  constructor(
    public user: string,
    public type: string,
    public data: NotificationData | null,
    public read: boolean,
    public isActive: boolean,
    public createdAt: Date,
    public id?: string
  ) {}
}

export interface NotificationData {
  title: string;
  message: string;
  metadata?: {
    documentId?: string;
    blockchainHash?: string;
    sender?: string;
    recipient?: string;
  };
}
