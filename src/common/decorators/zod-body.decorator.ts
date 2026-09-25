import { Body } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { ZodType } from "zod";

import { ZodBodyPipe } from "../pipes/zod-body.pipe";
import { withMethodDocs } from "../swagger/method-docs";
import { zodToOpenApi } from "../swagger/zod-openapi";

/**
 * Validates the body and documents it from the same schema, so the two can never disagree.
 */
export const ZodBody = (schema: ZodType) =>
  withMethodDocs(Body(new ZodBodyPipe(schema)), [ApiBody({ schema: zodToOpenApi(schema) })]);
