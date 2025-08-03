import { User } from "../models/user.entity";

export interface IUserRepository {
  getProfile(uuid: string): Promise<Partial<User> | null>;
  findById(id: string): Promise<User | null>;
  findByUUID(uuid: string): Promise<User | null>;
}
