// src/domain/models/notification.entity.ts
export class Notification {
  constructor(
    public user: string,
    public read: boolean,
    public isActive: boolean,
    public id?: string
  ) {}
}
