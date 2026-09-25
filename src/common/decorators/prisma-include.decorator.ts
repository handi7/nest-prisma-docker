import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { Request } from "express";

import { getAllowedPaths, parseInclude } from "../helpers/prisma-query.helper";
import { withMethodDocs } from "../swagger/method-docs";

export function PrismaInclude<T extends object>(allowed: T) {
  const parameter = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    if (query.select) {
      return undefined;
    }

    const include = parseInclude(query.include as string, allowed);

    return include;
  })();

  // The allow-list is the answer to "what can I actually pass here?", so it belongs in the docs.
  const allowedPaths = getAllowedPaths(allowed, "include").join("`, `");

  return withMethodDocs(parameter, [
    ApiQuery({
      name: "include",
      required: false,
      schema: { type: "string" },
      description: [
        "Comma-separated relations to embed.",
        `Allowed: \`${allowedPaths}\`.`,
        "Ignored when `select` is present.",
      ].join(" "),
    }),
  ]);
}
