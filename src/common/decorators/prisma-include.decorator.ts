import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

import { parseInclude } from "../helpers/prisma-query.helper";

export function PrismaInclude<T extends object>(allowed: T) {
  return createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    if (query.select) {
      return undefined;
    }

    const include = parseInclude(query.include as string, allowed);

    return include;
  })();
}
