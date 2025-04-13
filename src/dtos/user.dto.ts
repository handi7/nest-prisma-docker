import { Permission, Role, RolePermission, User } from "prisma/client";

export interface UserDto extends User {
  role?: Role & { permissions?: (RolePermission & { permission?: Permission })[] };
}
