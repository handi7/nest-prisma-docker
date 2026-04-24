import { Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ZodQueryPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    const query = this.asRecord(value);
    let sanitized: Record<string, unknown> = { ...query };

    for (let index = 0; index < 20; index += 1) {
      const result = this.schema.safeParse(sanitized);
      if (result.success) {
        return result.data;
      }

      const invalidKeys = new Set<string>();
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && key in sanitized) {
          invalidKeys.add(key);
        }
      }

      if (!invalidKeys.size) {
        break;
      }

      for (const key of invalidKeys) {
        delete sanitized[key];
      }
    }

    const fallbackResult = this.schema.safeParse({});
    if (fallbackResult.success) {
      return fallbackResult.data;
    }

    return sanitized;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return value as Record<string, unknown>;
  }
}
