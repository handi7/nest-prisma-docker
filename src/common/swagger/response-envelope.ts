import {
  OpenAPIObject,
  OperationObject,
  PathItemObject,
  ResponseObject,
  SchemaObject,
} from "@nestjs/swagger";

import { PUBLIC_EXTENSION } from "../decorators/public.decorator";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head"] as const;

/**
 * Shape produced by the paginate() helper. Only list endpoints fill it in, so the envelope
 * keeps it nullable.
 */
const PAGINATION_META: SchemaObject = {
  type: "object",
  nullable: true,
  properties: {
    pagination: {
      type: "object",
      properties: {
        total: { type: "integer", example: 137 },
        totalPages: { type: "integer", example: 14 },
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        prevPage: { type: "integer", nullable: true, example: null },
        nextPage: { type: "integer", nullable: true, example: 2 },
        search: { type: "string", nullable: true, example: "" },
        sortBy: { type: "string", nullable: true, example: "created_at" },
        desc: { type: "boolean", example: false },
      },
    },
  },
};

/** ZodBodyPipe passes Zod's issues through as-is. */
const VALIDATION_ERRORS: SchemaObject = {
  type: "array",
  nullable: true,
  items: {
    type: "object",
    properties: {
      code: { type: "string", example: "too_small" },
      path: {
        type: "array",
        items: { oneOf: [{ type: "string" }, { type: "integer" }] },
        example: ["items", 0, "quantity"],
      },
      message: { type: "string", example: "Too small: expected number to be >0" },
    },
  },
};

function envelopeBase(method: string, path: string, statusCode: number) {
  return {
    method: { type: "string", example: method.toUpperCase() },
    route: { type: "string", example: path },
    timestamp: { type: "string", format: "date-time" },
    responseTime: { type: "string", example: "12.34ms" },
    statusCode: { type: "integer", example: statusCode },
  } satisfies Record<string, SchemaObject>;
}

/**
 * Every handler's return value is rewritten by ResponseInterceptor before it leaves the
 * process, so the documented body has to be the envelope — not what the controller returns.
 */
function successEnvelope(
  data: SchemaObject,
  statusCode: number,
  method: string,
  path: string,
): SchemaObject {
  return {
    type: "object",
    properties: {
      ...envelopeBase(method, path, statusCode),
      success: { type: "boolean", example: true },
      message: { type: "string", example: statusCode === 201 ? "CREATED" : "OK" },
      data,
      meta: PAGINATION_META,
      error: { nullable: true, example: null },
    },
  };
}

/** Mirrors HttpExceptionFilter, which owns every non-2xx body. */
function errorResponse(
  statusCode: number,
  type: string,
  message: string,
  method: string,
  path: string,
): ResponseObject {
  return {
    description: `${type} — ${message}`,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            ...envelopeBase(method, path, statusCode),
            success: { type: "boolean", example: false },
            message: { type: "string", example: message },
            data: { nullable: true, example: null },
            meta: { nullable: true, example: null },
            error: {
              type: "object",
              properties: {
                type: { type: "string", example: type },
                errors: statusCode === 400 ? VALIDATION_ERRORS : { nullable: true, example: null },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Wraps every documented response in the real envelope and fills in the failure modes the
 * global guards, pipes and filter can produce.
 *
 * Done as a pass over the finished document rather than per-endpoint decorators: the
 * interceptor and the filter are global, so the documentation of their behaviour should be
 * global too — no endpoint can forget to opt in.
 */
export function applyResponseEnvelope(document: OpenAPIObject): void {
  for (const [path, pathItem] of Object.entries(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation: OperationObject = (pathItem as PathItemObject)[method];

      if (!operation) {
        continue;
      }

      const isPublic = Boolean(operation[PUBLIC_EXTENSION]);
      delete operation[PUBLIC_EXTENSION];

      if (isPublic) {
        // An empty requirement overrides the document-wide bearer requirement.
        operation.security = [];
      }

      const responses = (operation.responses ??= {});

      for (const [code, response] of Object.entries(responses)) {
        if (!code.startsWith("2")) {
          continue;
        }

        const documented = response as ResponseObject;
        const data = (documented.content?.["application/json"]?.schema as SchemaObject) ?? {};

        documented.content = {
          "application/json": { schema: successEnvelope(data, Number(code), method, path) },
        };
      }

      const failures: Record<string, ResponseObject> = {
        500: errorResponse(500, "Internal Server Error", "Internal Server Error", method, path),
      };

      if (!isPublic) {
        failures[401] = errorResponse(401, "Unauthorized", "Token is required", method, path);
        failures[403] = errorResponse(403, "Forbidden", "Insufficient permission", method, path);
      }

      // Only body validation raises 400 — ZodQueryPipe drops bad query values instead of throwing.
      if (operation.requestBody) {
        failures[400] = errorResponse(400, "Bad Request", "Validation failed", method, path);
      }

      if (path.includes("{")) {
        failures[404] = errorResponse(404, "Not Found", "Resource not found", method, path);
      }

      for (const [code, response] of Object.entries(failures)) {
        responses[code] ??= response;
      }
    }
  }
}
