import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { Request } from "express";

import { getAllowedPaths, parseSelect } from "../helpers/prisma-query.helper";
import { withMethodDocs } from "../swagger/method-docs";

export function PrismaSelect<T extends object>(allowed: T) {
  const parameter = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    const select = parseSelect(query.select as string, allowed);

    return select;
  })();

  // The allow-list is the answer to "what can I actually pass here?", so it belongs in the docs.
  const allowedPaths = getAllowedPaths(allowed, "select").join("`, `");

  return withMethodDocs(parameter, [
    ApiQuery({
      name: "select",
      required: false,
      schema: { type: "string" },
      description: [
        "Comma-separated fields to return instead of the full record.",
        `Allowed: \`${allowedPaths}\`.`,
        "Takes precedence over `include`.",
      ].join(" "),
    }),
  ]);
}
