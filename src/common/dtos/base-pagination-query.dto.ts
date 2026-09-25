import z from "zod";

/**
 * Query-string boolean: accepts `true/false/1/0` (any case) and rejects everything else,
 * unlike `z.coerce.boolean()` which turns the string "false" into `true`.
 */
export const StrictBooleanQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }

  return value;
}, z.boolean());

// Every field is optional or defaulted, so a bare `GET /resource` parses. The upper bound on
// `limit` is enforced by paginate(), which clamps rather than rejects. `include`/`select` are
// read from the raw query by @PrismaInclude/@PrismaSelect, which also document them.
export const BasePaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
  search: z.string().default(""),
  sortBy: z.string().optional(),
  desc: StrictBooleanQuerySchema.default(false),
});

export type BasePaginationQueryDto = z.infer<typeof BasePaginationQuerySchema>;
