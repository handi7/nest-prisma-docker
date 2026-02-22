import z from "zod";

export const BasePaginationQuerySchema = z.object({
  page: z
    .string()
    .default("1")
    .transform((value) => parseInt(value) || 1),
  limit: z
    .string()
    .optional()
    .transform((value) => parseInt(value) || 10),
  search: z.string().default(""),
  sortBy: z.string(),
  desc: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
});

export type BasePaginationQueryDto = z.infer<typeof BasePaginationQuerySchema>;
