import { User } from 'src/types/User';
import {
  toRoleWithPermissionNames,
  toRoleWithPermissions,
} from '../role/role.mapper';

export function toUserWithRoleAndPermissions(user: User) {
  return {
    ...user,
    role: toRoleWithPermissions(user.role as any),
  };
}

export function toUserWithRoleAndPermissionNames(user: User) {
  return {
    ...user,
    role: toRoleWithPermissionNames(user.role as any),
  };
}
