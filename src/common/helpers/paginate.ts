export interface PaginateOptions {
  page?: number;
  size?: number;
  searchFields?: string[];
  s?: string;
  sortBy?: string;
  desc?: boolean;
  allowedSortBy?: string[];
}

interface PaginateArgs {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}

export async function paginate<T, Args extends PaginateArgs, R = T>(
  prismaModel: {
    findMany: (args: Args) => Promise<T[]>;
    count: (args?: any) => Promise<number>;
  },
  args: Args,
  options: PaginateOptions = {},
  mapper?: (item: T) => R,
) {
  const {
    page = 1,
    s: search = "",
    searchFields = [],
    sortBy = "",
    desc = false,
    allowedSortBy = [],
  } = options;

  const size = Number(options.size) || 10;

  const where = args.where || {};

  if (search && searchFields.length) {
    const searchQuery = searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    }));

    where.OR = searchQuery;
  }

  const isSortAllowed = allowedSortBy.length > 0 || allowedSortBy.includes(sortBy);
  const orderBy = isSortAllowed && sortBy ? [{ [sortBy]: desc ? "desc" : "asc" }] : [];

  const [data, total] = await Promise.all([
    prismaModel.findMany({
      ...args,
      where,
      skip: (page - 1) * size,
      take: size,
      orderBy,
    }),
    prismaModel.count({ where }),
  ]);

  const transformed = mapper ? data.map(mapper) : data;

  const totalPages = Math.ceil(total / size);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return {
    data: transformed,
    meta: {
      total,
      totalPages,
      page,
      size,
      prevPage,
      nextPage,
      search,
      sortBy: isSortAllowed ? sortBy : null,
      desc,
    },
  };
}
