import { SetMetadata, applyDecorators } from "@nestjs/common";
import { ApiExtension } from "@nestjs/swagger";

export const IS_PUBLIC_KEY = "isPublic";

/** Read by the Swagger setup to drop the padlock and the 401/403 responses on these routes. */
export const PUBLIC_EXTENSION = "x-public";

export const Public = () =>
  applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), ApiExtension(PUBLIC_EXTENSION, true));
