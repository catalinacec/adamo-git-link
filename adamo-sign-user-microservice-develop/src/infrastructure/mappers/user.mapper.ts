import { User } from "../../domain/models/user.entity";
import { IUserModel } from "../../infrastructure/repositories/user.repository";

export class UserMapper {
  static toDomain(raw: IUserModel): User {
    return new User(
      (raw._id as string).toString(),
      raw.name,
      raw.surname,
      raw.email,
      raw.password,
      raw.language,
      raw.photo,
      raw.roles,
      raw.isActive,
      raw.profileImageUrl,
      raw.firstLogin,
      raw.twoFactorAuthEnabled,
      raw.__s,
      raw.temporaryPassword,
      raw.temporaryPasswordExpiresAt,
      raw.acceptTerms,
      raw.createdAt,
      raw.updatedAt
    );
  }

  static toPersistence(user: User): IUserModel {
    return {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      language: user.language,
      photo: user.photo,
      roles: user.roles,
      isActive: user.isActive,
      profileImageUrl: user.profileImageUrl,
      firstLogin: user.firstLogin,
      twoFactorAuthEnabled: user.twoFactorAuthEnabled,
      __s: user.__s,
      temporaryPassword: user.temporaryPassword,
      temporaryPasswordExpiresAt: user.temporaryPasswordExpiresAt,
      acceptTerms: user.acceptedTerms,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as IUserModel;
  }
}
