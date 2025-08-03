import { Model, Document } from "mongoose";

export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface PaginateOptions {
  page?: number;
  limit?: number;
  sort?: object | string;
  customLabels?: any;
  collation?: object;
  lean?: boolean;
  leanWithId?: boolean;
  populate?: object[] | string[];
  projection?: object | string;
  options?: object;
}

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(
    query?: object,
    options?: PaginateOptions
  ): Promise<PaginateResult<T>>;
}
