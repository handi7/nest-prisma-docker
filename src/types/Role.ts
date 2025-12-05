import {
  Permission,
  Role as PRole,
  RolePermission as PRolePermission,
} from "generated/prisma/client";

export interface Role extends PRole {
  permissions?: RolePermission[];
  permissionNames?: string[];
}

export interface RolePermission extends PRolePermission {
  role?: Role;
  permission?: Permission;
}
