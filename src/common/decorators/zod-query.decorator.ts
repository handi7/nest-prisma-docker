import { Query } from "@nestjs/common";
import { ZodType } from "zod";

import { BasePaginationQuerySchema } from "../dtos/base-pagination-query.dto";
import { ZodQueryPipe } from "../pipes/zod-query.pipe";

export const ZodQuery = (schema: ZodType = BasePaginationQuerySchema) =>
  Query(new ZodQueryPipe(schema));
