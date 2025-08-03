export class WelcomeData {
  constructor(
    public welcomeMessage: string,
    public plan: string,
    public documents: DocumentsData,
    public notifications: NotificationData
  ) {}
}

export interface DocumentsData {
  completed: number;
  rejected: number;
  inProcess: number;
}

export interface NotificationData {
  unread: number;
}
