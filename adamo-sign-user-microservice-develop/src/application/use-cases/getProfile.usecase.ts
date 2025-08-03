import { User } from "../../domain/models/user.entity";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpError } from "../../utils/httpError";

export class GetProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<Partial<User> | null> {
    if (!userId) {
      throw new HttpError(400, t("validation.required", { field: "userId" }));
    }

    const userProfile = await this.userRepository.getProfile(userId);
    if (!userProfile) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: "User" })
      );
    }

    return userProfile;
  }
}
