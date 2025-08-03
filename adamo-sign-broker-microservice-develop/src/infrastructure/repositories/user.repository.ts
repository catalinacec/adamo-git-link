import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/models/user.entity";
import mongoose, { Document, Schema } from "mongoose";
import { UserMapper } from "../mappers/user.mapper";

enum TermsAndConditionsStatus {
  Accepted = "Accepted",
  Rejected = "Rejected",
}

export interface IUserModel extends Document {
  uuid: string;
  name: string;
  surname: string;
  email: string;
  roles: string[];
  isActive: boolean;
  profileImageUrl: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserModel>(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    isActive: { type: Boolean, default: true },
    profileImageUrl: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      enum: ["en", "es"],
      default: "en",
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserModel>("User", UserSchema);

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return await this.findOneAndMap({ _id: id });
  }

  async findOneAndMap(query: Record<string, any>): Promise<User | null> {
    const user = (await UserModel.findOne(query)) as IUserModel;
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByOwnerId(ownerId: string): Promise<User | null> {
    return await this.findOneAndMap({ uuid: ownerId });
  }
}
