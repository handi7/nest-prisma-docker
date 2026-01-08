import {
  Permission,
  Role as PRole,
  RolePermission as PRolePermission,
  User,
} from "generated/prisma/client";

export interface Role extends PRole {
  permissions?: RolePermission[];
  permissionNames?: string[];
  users?: User[];
}

export interface RolePermission extends PRolePermission {
  role?: Role;
  permission?: Permission;
}
