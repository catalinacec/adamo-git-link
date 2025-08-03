import { User } from "../models/user.entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByOwnerId(ownerId: string): Promise<User | null>;
}
