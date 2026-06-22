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
  options: PaginateOptions = {},
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
    stableSortBy = [],
  } = options;

  const safePage = Number.isFinite(Number(page)) ? Math.max(Number(page), 1) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(Math.max(Number(limit), 1), 100) : 10;

  const where = { ...(baseArgs.where || {}) };

  // 🔍 SEARCH
  const searchWhere = buildSearchWhere(search ?? "", searchFields);
  if (searchWhere) {
    where.AND = where.AND
      ? [...(Array.isArray(where.AND) ? where.AND : [where.AND]), searchWhere]
      : [searchWhere];
  }

  // ↕️ SORT
  const normalizedSortBy = sortBy?.trim();
  const isSortAllowed =
    !!normalizedSortBy && (allowedSortBy.length ? allowedSortBy.includes(normalizedSortBy) : true);
  const direction: "asc" | "desc" = desc ? "desc" : "asc";

  const sortFields = [
    ...(isSortAllowed && normalizedSortBy ? [normalizedSortBy] : []),
    ...stableSortBy,
  ];

  const uniqueSortFields = [...new Set(sortFields)];

  const builtOrderBy = uniqueSortFields
    .map((field) => buildOrderByFromPath(field, direction))
    .filter(Boolean);

  const orderBy = builtOrderBy.length ? [...builtOrderBy, { id: "asc" }] : (baseArgs.orderBy ?? []);

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
      pagination: {
        total,
        totalPages,
        page: safePage,
        limit: safeLimit,
        prevPage: safePage > 1 ? safePage - 1 : null,
        nextPage: safePage < totalPages ? safePage + 1 : null,
        search,
        sortBy: isSortAllowed && normalizedSortBy ? normalizedSortBy : null,
        desc,
      },
    },
  };
}

function buildOrderByFromPath(fieldPath: string, direction: "asc" | "desc") {
  const keys = fieldPath
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!keys.length) {
    return null;
  }

  return keys.reduceRight<any>((acc, key, index) => {
    if (index === keys.length - 1) {
      return { [key]: direction };
    }

    return { [key]: acc };
  }, {});
}

function buildSearchWhere(search: string, fields: string[]): Record<string, any> | undefined {
  if (!search || !fields.length) return undefined;

  const conditions = fields
    .map((field) => buildSearchConditionFromPath(field, search))
    .filter(Boolean);

  if (!conditions.length) {
    return undefined;
  }

  return {
    OR: conditions,
  };
}

function buildSearchConditionFromPath(fieldPath: string, search: string) {
  const keys = fieldPath
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!keys.length) {
    return null;
  }

  return keys.reduceRight<any>((acc, key, index) => {
    if (index === keys.length - 1) {
      return {
        [key]: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    return { [key]: acc };
  }, {});
}

export function parsePaginationQuery(
  query: BasePaginationQueryDto,
  overrides?: Partial<PaginateOptions>,
): PaginateOptions {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    search: query.search,
    sortBy: query.sortBy,
    desc: query.desc,
    ...overrides,
  };
}
