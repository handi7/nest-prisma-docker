import { Role } from "src/types/Role";

export function toRoleWithPermissions({ permissions, ...role }: Role) {
  return {
    ...role,
    permissions: permissions.map((permission) => permission.permission),
    users: role.users,
  };
}

export function toRoleWithPermissionNames({ permissions, ...role }: Role) {
  return {
    ...role,
    permissionNames: permissions.map((permission) => permission.permission.name),
  };
}
