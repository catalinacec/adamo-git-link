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
    enabledRead?: boolean;
    typeRead?: string;
    blockchainHash?: string;
    sender?: string;
    recipient?: string;
    [key: string]: any;
  };
}
