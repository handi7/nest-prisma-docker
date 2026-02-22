import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { ZodError, ZodType } from "zod";

import { ZOD_SCHEMA_KEY } from "../decorators/zod-schema.decorator";

@Injectable()
export class GlobalZodInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    const handler = context.getHandler(); // ✅ METHOD
    const schema = this.reflector.get<ZodType>(ZOD_SCHEMA_KEY, handler);

    if (!schema) return next.handle();

    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed.",
        validation: this.formatZodErrors(result.error),
      });
    }

    req.body = result.data; // 🔥 body sudah clean & typed
    return next.handle();
  }

  private formatZodErrors(error: ZodError) {
    const map = new Map<string, string>();

    for (const issue of error.issues || []) {
      const field = issue.path.join(".");
      const msg = map.get(field);

      map.set(field, `${msg ? `${msg} ` : ""}${issue.message}`);
    }

    return Array.from(map.entries()).map(([field, message]) => ({
      field,
      message,
    }));
  }
}
