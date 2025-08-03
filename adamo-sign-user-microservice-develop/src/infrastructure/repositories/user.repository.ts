import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { AcceptedTerm, User } from "../../domain/models/user.entity";
import mongoose, { Document, Schema } from "mongoose";
import { UserMapper } from "../mappers/user.mapper";

enum TermsAndConditionsStatus {
  Accepted = "Accepted",
  Rejected = "Rejected",
}

export interface IUserModel extends Document {
  name: string;
  surname: string;
  email: string;
  password: string;
  firstLogin: boolean;
  language: string;
  photo: string;
  roles: string[];
  isActive: boolean;
  profileImageUrl: string;
  twoFactorAuthEnabled: boolean;
  __s: string | undefined;
  temporaryPassword: string;
  temporaryPasswordExpiresAt: Date;
  acceptTerms: AcceptedTerm[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserModel>(
  {
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
    password: { type: String, required: true },
    firstLogin: { type: Boolean, default: true },
    language: {
      type: String,
      default: "en",
    },
    photo: { type: String, required: false },
    roles: {
      type: [String],
      default: ["user"],
    },
    isActive: { type: Boolean, default: true },
    profileImageUrl: { type: String, required: false },
    twoFactorAuthEnabled: { type: Boolean, default: false },
    __s: { type: String, required: false },
    temporaryPassword: { type: String, required: false },
    temporaryPasswordExpiresAt: { type: Date, required: false },
    acceptTerms: [
      {
        type: {
          type: String,
          enum: Object.values(TermsAndConditionsStatus),
        },
        termId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Term",
        },
      },
    ],
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserModel>("User", UserSchema);

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const persistenceUser = UserMapper.toPersistence(user);
    const created = (await UserModel.create(persistenceUser)) as IUserModel;
    return UserMapper.toDomain(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOneAndMap({ email });
  }

  async findById(id: string): Promise<User | null> {
    return await this.findOneAndMap({ _id: id });
  }

  async findOneAndMap(query: Record<string, any>): Promise<User | null> {
    const user = (await UserModel.findOne(query)) as IUserModel;
    return user ? UserMapper.toDomain(user) : null;
  }

  private async findByIdAndUpdate(
    userId: string,
    updateData: Record<string, any>
  ): Promise<User | null> {
    const updatedUser = (await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    })) as IUserModel;

    return updatedUser ? UserMapper.toDomain(updatedUser) : null;
  }

  async update(user: Partial<User>): Promise<Partial<User> | null> {
    if (!user._id) throw new Error("User ID is null");

    const updated = await this.findByIdAndUpdate(user._id, {
      name: user.name,
      surname: user.surname,
      language: user.language,
      photo: user.photo,
      __s: user.__s,
      twoFactorAuthEnabled: user.twoFactorAuthEnabled,
      password: user.password,
      profileImageUrl: user.profileImageUrl,
    });

    if (!updated) throw new Error("User not found");

    // Excluir el password para no retornarlo en el perfil
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async acceptTerms(
    userId: string,
    termId: string,
    accepted: boolean
  ): Promise<void> {
    const status = accepted
      ? TermsAndConditionsStatus.Accepted
      : TermsAndConditionsStatus.Rejected;

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          acceptTerms: {
            type: status,
            termId: new mongoose.Types.ObjectId(termId),
          },
        },
      },
      { new: true }
    );
  }

  async getProfile(userId: string): Promise<Partial<User> | null> {
    const user = await this.findOneAndMap({ _id: userId });
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
