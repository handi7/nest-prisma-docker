import { SetMetadata } from "@nestjs/common";
import { ZodType } from "zod";

export const ZOD_SCHEMA_KEY = "zod:schema";

export const ZodSchema = (schema: ZodType) => SetMetadata(ZOD_SCHEMA_KEY, schema);
