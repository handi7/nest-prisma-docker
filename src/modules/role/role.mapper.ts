import { Role } from "src/types/Role";
import { User } from "src/types/User";

type RoleWithRelations = Role & {
  permissions: { permission: any }[];
  users?: User[];
};

export function toRoleWithPermissions({ permissions, ...role }: RoleWithRelations) {
  return {
    ...role,
    permissions: permissions.map((permission) => permission.permission),
    users: role.users,
  };
}

export function toRoleWithPermissionNames({ permissions, ...role }: RoleWithRelations) {
  return {
    ...role,
    permissionNames: permissions.map((permission) => permission.permission.name),
  };
}
