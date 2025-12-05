import { Permission } from "generated/prisma/client";

export function mapToGroupedPermissions(permissions: Permission[]) {
  const grouped = Object.values(
    permissions.reduce(
      (acc, item) => {
        const parts = item.name.split("_");
        const object = parts.slice(1).join("_");
        if (!acc[object]) {
          acc[object] = { label: object, items: [] };
        }
        acc[object].items.push(item);
        return acc;
      },
      {} as Record<string, { label: string; items: typeof permissions }>,
    ),
  );

  return grouped;
}
