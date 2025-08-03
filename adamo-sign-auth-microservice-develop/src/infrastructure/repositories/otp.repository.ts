import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { Otp } from "../../domain/models/otp.entity";
import mongoose, { Document, Schema } from "mongoose";

interface IOtpModel extends Document {
  userId: string;
  code: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtpModel>(
  {
    userId: { type: Schema.Types.String, ref: "User", required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const OtpModel = mongoose.model<IOtpModel>("Otp", OtpSchema);

export class OtpRepository implements IOtpRepository {
  async create(otp: Otp): Promise<Otp> {
    const created = await OtpModel.create({
      userId: new mongoose.Types.ObjectId(otp.userId),
      code: otp.code,
      attempts: otp.attempts,
      expiresAt: otp.expiresAt,
    });
    return new Otp(
      (created._id as IOtpModel).toString(),
      created.userId.toString(),
      created.code,
      created.attempts,
      created.expiresAt,
      created.createdAt
    );
  }

  async findByUserIdAndCode(userId: string, code: string): Promise<Otp | null> {
    const otpRecord = await OtpModel.findOne({ userId, code });
    if (!otpRecord) return null;
    return new Otp(
      (otpRecord._id as IOtpModel).toString(),
      otpRecord.userId.toString(),
      otpRecord.code,
      otpRecord.attempts,
      otpRecord.expiresAt,
      otpRecord.createdAt
    );
  }

  async update(otp: Otp): Promise<Otp> {
    const updated = await OtpModel.findByIdAndUpdate(
      otp.id,
      {
        userId: otp.userId,
        code: otp.code,
        expiresAt: otp.expiresAt,
      },
      { new: true }
    );
    if (!updated) throw new Error("OTP not found");
    return new Otp(
      (updated._id as IOtpModel).toString(),
      updated.userId.toString(),
      updated.code,
      updated.attempts,
      updated.expiresAt,
      updated.createdAt
    );
  }

  async deleteById(id: string): Promise<void> {
    await OtpModel.findByIdAndDelete(id);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await OtpModel.deleteMany({ userId });
  }

  async upsert(otp: Otp): Promise<Otp> {
    const updated = await OtpModel.findOneAndUpdate(
      { userId: otp.userId },
      { code: otp.code, expiresAt: otp.expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!updated) throw new Error("Failed to upsert OTP");
    return new Otp(
      (updated._id as IOtpModel).toString(),
      updated.userId.toString(),
      updated.code,
      updated.attempts,
      updated.expiresAt,
      updated.createdAt
    );
  }

  async findLatestByUserId(userId: string): Promise<Otp | null> {
    const record = await OtpModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!record) return null;

    return new Otp(
      record._id.toString(),
      record.userId.toString(),
      record.code,
      record.attempts,
      record.expiresAt,
      record.createdAt
    );
  }
}
