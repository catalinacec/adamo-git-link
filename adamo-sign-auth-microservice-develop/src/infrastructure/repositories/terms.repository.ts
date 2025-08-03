import mongoose, { Document, Schema } from "mongoose";
import { ITermRepository } from "../../domain/repositories/ITermRepository";
import { Term } from "../../domain/models/term.entity";

// Enum para términos y condiciones
export enum TermsAndConditionsStatus {
  Accepted = "Accepted",
  Rejected = "Rejected",
}

interface ITermModel extends Document {
  name: string;
  description: string;
  version: string | number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const TermSchema = new Schema<ITermModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    version: { type: Schema.Types.Mixed, required: true }, // Puede ser string o number
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
    },
  },
  { timestamps: true }
);

export const TermModel = mongoose.model<ITermModel>("Term", TermSchema);

export class TermRepository implements ITermRepository {
  async create(log: Partial<Term>): Promise<Term> {
    const created = (await TermModel.create({
      name: log.name,
      description: log.description,
      version: log.version,
      status: log.status,
    })) as ITermModel;

    return new Term(
      (created._id as mongoose.Types.ObjectId).toString(),
      created.name,
      created.description,
      created.version,
      created.status,
      created.createdAt,
      created.updatedAt
    );
  }

  async findById(id: string): Promise<Term | null> {
    const term = await TermModel.findById(id).exec();
    return term
      ? new Term(
          (term._id as mongoose.Types.ObjectId).toString(),
          term.name,
          term.description,
          term.version,
          term.status,
          term.createdAt,
          term.updatedAt
        )
      : null;
  }

  async findByUserId(userId: string): Promise<Term[]> {
    const terms = await TermModel.find({ userId }).exec();
    return terms.map(
      (term) =>
        new Term(
          (term._id as mongoose.Types.ObjectId).toString(),
          term.name,
          term.description,
          term.version,
          term.status,
          term.createdAt,
          term.updatedAt
        )
    );
  }

  async deleteById(id: string): Promise<void> {
    await TermModel.findByIdAndDelete(id).exec();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await TermModel.deleteMany({ userId }).exec();
  }
}
