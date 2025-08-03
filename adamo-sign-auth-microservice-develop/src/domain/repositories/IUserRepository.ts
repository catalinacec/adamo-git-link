import { User } from "../models/user.entity";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  acceptTerms(userId: string, termId: string, accepted: boolean): Promise<void>;
}
