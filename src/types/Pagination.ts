export interface PaginateOptions {
  page?: number;
  limit?: number;

  search?: string;
  searchFields?: string[];

  sortBy?: string;
  desc?: boolean;
  allowedSortBy?: string[];
  stableSortBy?: string[];
}

export interface PaginateMeta {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  prevPage: number | null;
  nextPage: number | null;
  search?: string;
  sortBy?: string | null;
  desc?: boolean;
}

export interface PaginateResult<T> {
  data: T[];
  meta: {
    pagination: PaginateMeta;
  };
}

export interface PrismaPaginateModel<FindManyArgs extends { where?: any }, Entity> {
  findMany(args: FindManyArgs): Promise<Entity[]>;
  count(where?: FindManyArgs["where"]): Promise<number>;
}
