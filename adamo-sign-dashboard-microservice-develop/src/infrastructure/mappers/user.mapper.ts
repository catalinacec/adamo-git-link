import { User } from "../../domain/models/user.entity";
import { IUserModel } from "../../infrastructure/repositories/user.repository";

export class UserMapper {
  static toDomain(raw: IUserModel): User {
    return new User(
      (raw._id as string).toString(),
      raw.name,
      raw.surname,
      raw.email,
      raw.plan
    );
  }

  static toPersistence(user: User): IUserModel {
    return {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      plan: user.plan,
    } as IUserModel;
  }
}
