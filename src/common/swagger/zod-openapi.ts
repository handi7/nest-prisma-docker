import { Logger } from "@nestjs/common";
import { ApiQuery, SchemaObject } from "@nestjs/swagger";
import { ZodType, toJSONSchema } from "zod";

const logger = new Logger("ZodOpenApi");

/**
 * `unrepresentable: "any"` keeps a transform-bearing schema (z.preprocess, z.transform) from
 * taking the whole document down — it degrades that one node to untyped instead of throwing.
 * `reused: "inline"` avoids $defs, which have nowhere to live inside an inline schema object.
 */
const BASE_OPTIONS = {
  target: "openapi-3.0",
  unrepresentable: "any",
  reused: "inline",
} as const;

/**
 * Converts a Zod schema into an OpenAPI schema object.
 *
 * `io` picks which side of a transform to document: "input" is what a client sends, "output"
 * is what it gets back. Request bodies and query strings always want "input".
 */
export function zodToOpenApi(schema: ZodType, io: "input" | "output" = "input"): SchemaObject {
  try {
    const converted = toJSONSchema(schema, {
      ...BASE_OPTIONS,
      io,
    }) as unknown as SchemaObject & { $schema?: string };

    // OpenAPI schema objects have no $schema key; leaving it in trips strict spec validators.
    delete converted.$schema;

    return converted;
  } catch (error) {
    logger.warn(`Zod schema could not be converted, documenting it as a bare object: ${error}`);

    return { type: "object" };
  }
}

/**
 * OpenAPI documents query strings one parameter at a time, so an object schema has to be
 * flattened into a decorator per property.
 */
export function zodToApiQueries(schema: ZodType): MethodDecorator[] {
  const converted = zodToOpenApi(schema);
  const required = new Set(converted.required ?? []);

  return Object.entries(converted.properties ?? {}).map(([name, property]) =>
    ApiQuery({
      name,
      required: required.has(name),
      schema: property as SchemaObject,
    }),
  );
}
