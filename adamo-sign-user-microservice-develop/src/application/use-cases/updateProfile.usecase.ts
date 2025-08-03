import { User } from "../../domain/models/user.entity";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpError } from "../../utils/httpError";
import { updateProfileSchema } from "../../validators/updateProfile.validator";

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userData: Partial<User>,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<Partial<User> | null> {
    if (!userData._id) {
      throw new HttpError(400, t("validation.required", { field: "userId" }));
    }

    await updateProfileSchema.validate(userData);

    const updatedProfile = await this.userRepository.update(userData);
    if (!updatedProfile) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: "User" })
      );
    }

    return updatedProfile;
  }
}
