import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/models/user.entity";
import { getRegisterUserSchema } from "../../validators/registerUser.validator";
import bcrypt from "bcrypt";
import { HttpError } from "../../utils/httpError";
import { sendWelcomeEmail } from "../services/email.service";
import { randomUUID } from "crypto";

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    name: string,
    surname: string,
    email: string,
    password: string,
    confirmPassword: string,
    t: (key: string, vars?: Record<string, any> | undefined) => string
  ): Promise<Omit<User, "password">> {
    const schema = getRegisterUserSchema(t);

    try {
      await schema.validate(
        {
          name,
          surname,
          email,
          password,
          confirmPassword,
        },
        { abortEarly: false }
      );
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(
        409,
        t("errors.resource.conflict", { entity: "user" })
      );
    }

    console.log("Creating user with email:", email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User(
      null, // id
      randomUUID(), // uuid
      name, // name
      surname, // surname
      email, // email
      hashedPassword, // password
      true, // firstLogin
      "en", // language
      "", // photo
      [], // roles
      true, // isActive
      "", // temporaryPassword
      undefined, // temporaryPasswordExpiresAt
      false, // twoFactorAuthEnabled
      "", // __s
      [], // acceptedTerms
      new Date(), // createdAt
      new Date() // updatedAt
    );
    const createdUser = await this.userRepository.create(user);

    const { password: _, ...userWithoutPassword } = createdUser;

    await sendWelcomeEmail(
      userWithoutPassword.email,
      userWithoutPassword.name,
      t
    );

    return userWithoutPassword;
  }
}
