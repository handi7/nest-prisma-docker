import z from "zod";

export const UpdateUserSchema = z.object({}).partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
