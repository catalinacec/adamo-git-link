export class Otp {
  constructor(
    public id: string | null,
    public userId: string,
    public code: string,
    public attempts: number,
    public expiresAt: Date,
    public createdAt?: Date
  ) {}
}
