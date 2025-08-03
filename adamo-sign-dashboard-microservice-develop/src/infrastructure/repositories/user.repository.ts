import { User } from "../../domain/models/user.entity";
import mongoose, { Document, Schema } from "mongoose";
import { UserMapper } from "../mappers/user.mapper";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export interface IUserModel extends Document {
  name: string;
  surname: string;
  email: string;
  plan: string;
}

const UserSchema = new Schema<IUserModel>({
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
  plan: {
    type: String,
    required: true,
  },
});

export const UserModel = mongoose.model<IUserModel>("User", UserSchema);

export class UserRepository implements IUserRepository {
  async findOneAndMap(query: Record<string, any>): Promise<User | null> {
    const user = (await UserModel.findOne(query)) as IUserModel;
    return user ? UserMapper.toDomain(user) : null;
  }

  async getProfile(uuid: string): Promise<Partial<User> | null> {
    const user = await this.findOneAndMap({ uuid: uuid });
    if (!user) return null;

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return await this.findOneAndMap({ _id: id });
  }

  async findByUUID(userUUID: string): Promise<User | null> {
    return await this.findOneAndMap({ uuid: userUUID });
  }
}
