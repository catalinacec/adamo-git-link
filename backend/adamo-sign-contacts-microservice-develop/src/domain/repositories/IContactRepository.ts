import { Log } from "../models/audit-log.entity";

export interface ILogRepository {
  create(log: Partial<Log>): Promise<Log>;
  findById(id: string): Promise<Log | null>;
  findByUserId(userId: string): Promise<Log[]>;
  deleteById(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
