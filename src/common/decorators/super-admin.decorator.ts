import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const SUPER_ADMIN_ROLE = "Super Admin";
export const SuperAdmin = () => SetMetadata(ROLES_KEY, [SUPER_ADMIN_ROLE]);
