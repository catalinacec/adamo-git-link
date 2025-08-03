import { User } from "../models/user.entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUUID(uuid: string): Promise<User | null>;
  findByOwnerId(id: string): Promise<User | null>;
  findAllActive(): Promise<User[]>;
}
