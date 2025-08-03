import { User } from "../models/user.entity";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: Partial<User>): Promise<Partial<User> | null>;
  acceptTerms(userId: string, termId: string, accepted: boolean): Promise<void>;
  getProfile(userId: string): Promise<Partial<User> | null>;
  findOneAndMap(query: Record<string, any>): Promise<User | null>;
}
