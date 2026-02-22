import { z } from "zod";

export const CreateRoleSchema = z.object({
  name: z.string().min(1, "Name is required.").min(3, "Name must be at least 3 characters long."),
  permissions: z.array(z.number()),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
