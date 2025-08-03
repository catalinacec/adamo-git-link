import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { AcceptedTerm, User } from "../../domain/models/user.entity";
import mongoose, { Document, Schema } from "mongoose";
import { randomUUID } from "crypto";

export enum TermsAndConditionsStatus {
  Accepted = "Accepted",
  Rejected = "Rejected",
}

interface IUserModel extends Document {
  uuid: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  firstLogin: boolean;
  language: string;
  photo: string;
  roles: string[];
  isActive: boolean;
  temporaryPassword: string;
  temporaryPasswordExpiresAt: Date;
  twoFactorAuthEnabled: boolean;
  __s: string;
  acceptTerms: AcceptedTerm[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserModel>(
  {
    uuid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    firstLogin: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    photo: { type: String, default: "" },
    roles: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    temporaryPassword: { type: String, required: false },
    temporaryPasswordExpiresAt: { type: Date, required: false },
    twoFactorAuthEnabled: { type: Boolean, default: false },
    __s: { type: String, required: false },
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
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUserModel>("User", UserSchema);

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const created = (await UserModel.create({
      uuid: randomUUID(),
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      firstLogin: user.firstLogin,
      temporaryPassword: user.temporaryPassword,
      temporaryPasswordExpiresAt: user.temporaryPasswordExpiresAt,
      // termsAndConditions: user.termsAndConditions,
    })) as IUserModel;

    return new User(
      (created._id as mongoose.Types.ObjectId).toString(),
      created.uuid,
      created.name,
      created.surname,
      created.email,
      created.password,
      created.firstLogin,
      created.language,
      created.photo,
      created.roles,
      created.isActive,
      created.temporaryPassword,
      created.temporaryPasswordExpiresAt,
      created.twoFactorAuthEnabled,
      created.__s,
      created.acceptTerms,
      created.createdAt,
      created.updatedAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return new User(
      (user._id as IUserModel).toString(),
      user.uuid,
      user.name,
      user.surname,
      user.email,
      user.password,
      user.firstLogin,
      user.language,
      user.photo,
      user.roles,
      user.isActive,
      user.temporaryPassword,
      user.temporaryPasswordExpiresAt,
      user.twoFactorAuthEnabled,
      user.__s,
      user.acceptTerms,
      user.createdAt,
      user.updatedAt
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return new User(
      (user._id as IUserModel).toString(),
      user.uuid,
      user.name,
      user.surname,
      user.email,
      user.password,
      user.firstLogin,
      user.language,
      user.photo,
      user.roles,
      user.isActive,
      user.temporaryPassword,
      user.temporaryPasswordExpiresAt,
      user.twoFactorAuthEnabled,
      user.__s,
      user.acceptTerms,
      user.createdAt,
      user.updatedAt
    );
  }

  async update(user: User): Promise<User> {
    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      {
        email: user.email,
        password: user.password,
        firstLogin: user.firstLogin,
        name: user.name,
        surname: user.surname,
        language: user.language,
        photo: user.photo,
        roles: user.roles,
        isActive: user.isActive,
        temporaryPassword: user.temporaryPassword,
        temporaryPasswordExpiresAt: user.temporaryPasswordExpiresAt,
        twoFactorAuthEnabled: user.twoFactorAuthEnabled,
        __s: user.__s,
        acceptTerms: user.acceptedTerms,
      },
      { new: true }
    );
    if (!updated) throw new Error("User not found");
    return new User(
      (updated._id as IUserModel).toString(),
      updated.uuid,
      updated.name,
      updated.surname,
      updated.email,
      updated.password,
      updated.firstLogin,
      updated.language,
      updated.photo,
      updated.roles,
      updated.isActive,
      updated.temporaryPassword,
      updated.temporaryPasswordExpiresAt,
      updated.twoFactorAuthEnabled,
      updated.__s,
      updated.acceptTerms,
      updated.createdAt,
      updated.updatedAt
    );
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
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  }
}
