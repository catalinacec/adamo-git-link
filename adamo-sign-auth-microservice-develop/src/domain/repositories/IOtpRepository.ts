import { Otp } from "../models/otp.entity";

export interface IOtpRepository {
  create(otp: Otp): Promise<Otp>;
  findByUserIdAndCode(userId: string, code: string): Promise<Otp | null>;
  update(otp: Otp): Promise<Otp>;
  deleteById(id: string): Promise<void>;
  upsert(otp: Otp): Promise<Otp>;
  findLatestByUserId(userId: string): Promise<Otp | null>;
  deleteAllByUserId(ids: string): Promise<void>;
}
