import { PaginateOptions, PaginateResult, PrismaPaginateModel } from "src/types/Pagination";

import { BasePaginationQueryDto } from "../dtos/base-pagination-query.dto";

export async function paginate<
  Entity,
  FindManyArgs extends {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  },
  Mapped = Entity,
>(
  model: PrismaPaginateModel<FindManyArgs, Entity>,
  baseArgs: FindManyArgs,
  options: PaginateOptions<Entity> = {},
  mapper?: (item: Entity) => Mapped,
): Promise<PaginateResult<Mapped>> {
  const {
    page = 1,
    limit = 10,
    search,
    searchFields = [],
    sortBy,
    desc = false,
    allowedSortBy = [],
  } = options;

  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 100); // anti abuse

  const where = { ...(baseArgs.where || {}) };

  // 🔍 SEARCH
  const searchWhere = buildSearchWhere<Entity>(search ?? "", searchFields);
  if (searchWhere) {
    where.AND = where.AND
      ? [...(Array.isArray(where.AND) ? where.AND : [where.AND]), searchWhere]
      : [searchWhere];
  }

  // ↕️ SORT
  const isSortAllowed =
    sortBy && allowedSortBy.length ? allowedSortBy.includes(sortBy as keyof Entity) : false;

  const orderBy = isSortAllowed ? [{ [sortBy!]: desc ? "desc" : "asc" }] : (baseArgs.orderBy ?? []);

  const skip = (safePage - 1) * safeLimit;
  const take = safeLimit;

  const [data, total] = await Promise.all([
    model.findMany({
      ...baseArgs,
      where,
      orderBy,
      skip,
      take,
    }),
    model.count(where),
  ]);

  const mapped = mapper ? data.map(mapper) : (data as unknown as Mapped[]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    data: mapped,
    meta: {
      total,
      totalPages,
      page: safePage,
      limit: safeLimit,
      prevPage: safePage > 1 ? safePage - 1 : null,
      nextPage: safePage < totalPages ? safePage + 1 : null,
      search,
      sortBy: isSortAllowed ? sortBy! : null,
      desc,
    },
  };
}

function buildSearchWhere<Entity>(
  search: string,
  fields: (keyof Entity)[],
): Record<string, any> | undefined {
  if (!search || !fields.length) return undefined;

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    })),
  };
}

export function parsePaginationQuery<Entity>(
  query: BasePaginationQueryDto,
  overrides?: Partial<PaginateOptions<Entity>>,
): PaginateOptions<Entity> {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    search: query.search,
    sortBy: query.sortBy,
    desc: query.desc === "true",
    ...overrides,
  };
}
