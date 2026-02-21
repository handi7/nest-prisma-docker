export const PERMISSIONS = [
  // User Permissions
  {
    code: "user.view",
    name: "View User",
  },
  {
    code: "user.create",
    name: "Create User",
  },
  {
    code: "user.edit",
    name: "Edit User",
  },
  {
    code: "user.delete",
    name: "Delete User",
  },

  // Role Permissions
  {
    code: "role.view",
    name: "View Role",
  },
  {
    code: "role.create",
    name: "Create Role",
  },
  {
    code: "role.edit",
    name: "Edit Role",
  },
  {
    code: "role.delete",
    name: "Delete Role",
  },

  // User Invite Permissions
  {
    code: "user_invite.view",
    name: "View User Invite",
  },
  {
    code: "user_invite.create",
    name: "Create User Invite",
  },
  {
    code: "user_invite.edit",
    name: "Edit User Invite",
  },
  {
    code: "user_invite.delete",
    name: "Delete User Invite",
  },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]["code"];

export const PERMISSION_GROUPS = PERMISSIONS.reduce(
  (acc, p) => {
    const [module] = p.code.split(".");
    acc[module] ??= [];
    acc[module].push(p);
    return acc;
  },
  {} as Record<string, (typeof PERMISSIONS)[number][]>,
);

export const PERMISSION_CODE_REGEX = /^[a-z_]+\.[a-z_]+$/;
