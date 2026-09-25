import { Query } from "@nestjs/common";
import { ZodType } from "zod";

import { BasePaginationQuerySchema } from "../dtos/base-pagination-query.dto";
import { ZodQueryPipe } from "../pipes/zod-query.pipe";
import { withMethodDocs } from "../swagger/method-docs";
import { zodToApiQueries } from "../swagger/zod-openapi";

/**
 * Parses the query string and documents every parameter in it from the same schema.
 */
export const ZodQuery = (schema: ZodType = BasePaginationQuerySchema) =>
  withMethodDocs(Query(new ZodQueryPipe(schema)), zodToApiQueries(schema));
