import z from "zod";

export const CreateUserInviteSchema = z.object({
  email: z.email("Invalid email address."),
  role_id: z.number().int("Invalid role id."),
});

export type CreateUserInviteDto = z.infer<typeof CreateUserInviteSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1, "Token is required."),
  name: z.string().min(1, "Name is required.").min(3, "Name must be at least 3 characters long."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters long."),
});

export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>;
