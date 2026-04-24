import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

import { parseSelect } from "../helpers/prisma-query.helper";

export function PrismaSelect<T extends object>(allowed: T) {
  return createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    const select = parseSelect(query.select as string, allowed);

    return select;
  })();
}
