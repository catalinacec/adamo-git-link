export class ApiResponse<T> {
  constructor(
    public message: string,
    public data: T | null,
    public errors?: string[],
    public pagination?: Pagination,
    public timestamp: Date = new Date()
  ) {}
}

export class Pagination {
  constructor(
    public currentPage: number,
    public totalPages: number,
    public pageSize: number,
    public totalItems: number,
    public nextPage: number | null,
    public prevPage: number | null,
    public hasNextPage: boolean,
    public hasPrevPage: boolean
  ) {}
}
