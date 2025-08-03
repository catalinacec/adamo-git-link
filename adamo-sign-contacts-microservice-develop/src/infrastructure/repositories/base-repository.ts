import { Document } from "mongoose";
import { PaginateModel } from "../../types/paginate-model";
import { Paginator } from "../../domain/models/paginator.model";

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: PaginateModel<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const newDocument = await this.model.create(data);
    return newDocument.toObject();
  }

  async findById(id: string): Promise<T | null> {
    const document = await this.model.findById(id).exec();
    return document ? document.toObject() : null;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const updatedDocument = await this.model
      .findByIdAndUpdate(id, data, {
        new: true,
      })
      .exec();
    return updatedDocument ? updatedDocument.toObject() : null;
  }

  async delete(id: string): Promise<T | null> {
    const deletedDocument = await this.model.findByIdAndDelete(id).exec();
    return deletedDocument ? deletedDocument.toObject() : null;
  }

  async findAll(
    query: object = {},
    page: number = 1,
    limit: number = 10
  ): Promise<Paginator<T>> {
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
    };

    const result = await this.model.paginate(query, options);

    return {
      docs: result.docs.map((doc) => doc.toObject()),
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage ?? null,
      nextPage: result.nextPage ?? null,
    };
  }
}
