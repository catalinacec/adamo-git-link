import { User } from "../../../domain/models/user.entity";
import { IUserModel } from "../../repositories/user.repository";

export class UserMapper {
  static toDomain(raw: IUserModel): User {
    return new User(
      (raw._id as string).toString(),
      raw.uuid,
      raw.name,
      raw.surname,
      raw.email,
      raw.roles,
      raw.isActive,
      raw.profileImageUrl || "",
      raw.createdAt,
      raw.updatedAt
    );
  }

  static toPersistence(user: User): IUserModel {
    return {
      _id: user._id,
      uuid: user.uuid,
      name: user.name,
      surname: user.surname,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as IUserModel;
  }
}
