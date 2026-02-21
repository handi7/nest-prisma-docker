import { SetMetadata } from "@nestjs/common";
import { PermissionCode } from "src/config/permissions";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: PermissionCode[]) => {
  return SetMetadata(PERMISSIONS_KEY, permissions);
};
