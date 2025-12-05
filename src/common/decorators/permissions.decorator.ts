import { SetMetadata } from "@nestjs/common";
import { PermissionsEnum } from "generated/prisma/enums";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: PermissionsEnum[]) => {
  return SetMetadata(PERMISSIONS_KEY, permissions);
};
