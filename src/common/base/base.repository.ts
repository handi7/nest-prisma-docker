import { PrismaService } from "src/services/prisma/prisma.service";

/**
 * Base repository class providing common CRUD operations for Prisma models
 * @template TDelegate - Prisma delegate type (e.g., PrismaClient['user'])
 * @template TModel - Model type returned by queries
 * @template TWhereInput - Where clause input type
 * @template TWhereUniqueInput - Unique where clause input type
 * @template TCreateInput - Create input type
 * @template TUpdateInput - Update input type
 * @template TOrderByInput - Order by input type
 * @template TInclude - Include/relations input type
 * @template TSelect - Select fields input type
 */
export abstract class BaseRepository<
  TDelegate,
  TModel,
  TWhereInput,
  TWhereUniqueInput,
  TCreateInput,
  TUpdateInput,
  TOrderByInput,
  TInclude = unknown,
  TSelect = unknown,
  TOmitFields = unknown,
> {
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly delegate: TDelegate,
    private readonly hasSoftDelete?: boolean,
  ) {}

  /**
   * Find a single record by unique identifier
   */
  async findUnique(
    where: TWhereUniqueInput,
    options?: {
      include?: TInclude;
      select?: TSelect;
      omit?: TOmitFields;
    },
  ): Promise<TModel | null> {
    return (this.delegate as any).findUnique({ where, ...options });
  }

  /**
   * Find a single record by ID
   */
  async findById(
    id: number | string,
    options?: {
      include?: TInclude;
      select?: TSelect;
      omit?: TOmitFields;
    },
  ): Promise<TModel | null> {
    return this.findUnique({ id } as TWhereUniqueInput, options);
  }

  /**
   * Find the first record matching the criteria
   */
  async findFirst(params?: {
    where?: TWhereInput;
    orderBy?: TOrderByInput | TOrderByInput[];
    include?: TInclude;
    select?: TSelect;
    skip?: number;
    take?: number;
  }): Promise<TModel | null> {
    return (this.delegate as any).findFirst(params);
  }

  /**
   * Find multiple records matching the criteria
   */
  async findMany(params?: {
    where?: TWhereInput;
    orderBy?: TOrderByInput | TOrderByInput[];
    skip?: number;
    take?: number;
    include?: TInclude;
    select?: TSelect;
    cursor?: TWhereUniqueInput;
  }): Promise<TModel[]> {
    return (this.delegate as any).findMany(params);
  }

  /**
   * Find all records (use with caution on large tables)
   */
  async findAll(params?: {
    include?: TInclude;
    select?: TSelect;
    orderBy?: TOrderByInput | TOrderByInput[];
  }): Promise<TModel[]> {
    return this.findMany(params);
  }

  /**
   * Create a new record
   */
  async create(
    data: TCreateInput,
    options?: {
      include?: TInclude;
      select?: TSelect;
    },
  ): Promise<TModel> {
    return (this.delegate as any).create({ data, ...options });
  }

  /**
   * Create multiple records in a single transaction
   */
  async createMany(params: {
    data: TCreateInput[];
    skipDuplicates?: boolean;
  }): Promise<{ count: number }> {
    return (this.delegate as any).createMany(params);
  }

  /**
   * Update a single record
   */
  async update(params: {
    where: TWhereUniqueInput;
    data: TUpdateInput;
    include?: TInclude;
    select?: TSelect;
  }): Promise<TModel> {
    return (this.delegate as any).update(params);
  }

  /**
   * Update a record by ID
   */
  async updateById(
    id: number | string,
    data: TUpdateInput,
    options?: {
      include?: TInclude;
      select?: TSelect;
      omit?: TOmitFields;
    },
  ): Promise<TModel> {
    return this.update({
      where: { id } as TWhereUniqueInput,
      data,
      ...options,
    });
  }

  /**
   * Update multiple records matching the criteria
   */
  async updateMany(params: {
    where?: TWhereInput;
    data: TUpdateInput;
  }): Promise<{ count: number }> {
    return (this.delegate as any).updateMany(params);
  }

  /**
   * Create or update a record (upsert)
   */
  async upsert(params: {
    where: TWhereUniqueInput;
    create: TCreateInput;
    update: TUpdateInput;
    include?: TInclude;
    select?: TSelect;
  }): Promise<TModel> {
    return (this.delegate as any).upsert(params);
  }

  /**
   * Delete a single record
   */
  async delete(params: {
    where: TWhereUniqueInput;
    include?: TInclude;
    select?: TSelect;
  }): Promise<TModel> {
    return (this.delegate as any).delete(params);
  }

  /**
   * Delete a single record (soft delete)
   */
  async deleteSoft(where: TWhereUniqueInput): Promise<TModel> {
    if (!this.hasSoftDelete) {
      throw new Error("Soft delete not supported for this model");
    }

    return this.update({
      where,
      data: { deleted_at: new Date() } as TUpdateInput,
    });
  }

  /**
   * Delete a record by ID
   */
  async deleteById(
    id: number | string,
    options?: { include?: TInclude; select?: TSelect; omit?: TOmitFields },
  ): Promise<TModel> {
    return this.delete({
      where: { id } as TWhereUniqueInput,
      ...options,
    });
  }

  /**
   * Delete a record by ID (soft delete)
   */
  async deleteSoftById(id: number | string): Promise<TModel> {
    return this.deleteSoft({ id } as TWhereUniqueInput);
  }

  /**
   * Delete multiple records matching the criteria
   */
  async deleteMany(params?: { where?: TWhereInput }): Promise<{ count: number }> {
    return (this.delegate as any).deleteMany(params);
  }

  /**
   * Delete multiple records matching the criteria (soft delete)
   */
  async deleteManySoft(where?: TWhereInput): Promise<{ count: number }> {
    if (!this.hasSoftDelete) {
      throw new Error("Soft delete not supported for this model");
    }

    return this.updateMany({
      where,
      data: { deleted_at: new Date() } as TUpdateInput,
    });
  }

  /**
   * Count records matching the criteria
   */
  async count(where?: TWhereInput): Promise<number> {
    return (this.delegate as any).count({ where });
  }

  /**
   * Check if a record exists
   */
  async exists(where: TWhereInput): Promise<boolean> {
    const count = await this.count(where);

    return count > 0;
  }

  /**
   * Check if a record exists by ID
   */
  async existsById(id: number | string): Promise<boolean> {
    return this.exists({ id } as TWhereInput);
  }

  /**
   * Aggregate records
   */
  async aggregate(params: {
    where?: TWhereInput;
    orderBy?: TOrderByInput | TOrderByInput[];
    skip?: number;
    take?: number;
    cursor?: TWhereUniqueInput;
    _count?: boolean | object;
    _avg?: object;
    _sum?: object;
    _min?: object;
    _max?: object;
  }): Promise<any> {
    return (this.delegate as any).aggregate(params);
  }

  /**
   * Execute operations within a transaction
   */
  async transaction<T>(fn: (tx: PrismaService) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn) as Promise<T>;
  }
}
