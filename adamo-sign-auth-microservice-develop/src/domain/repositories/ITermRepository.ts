import { Term } from "../models/term.entity";

export interface ITermRepository {
  create(log: Partial<Term>): Promise<Term>;
  findById(id: string): Promise<Term | null>;
  findByUserId(userId: string): Promise<Term[]>;
  deleteById(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
