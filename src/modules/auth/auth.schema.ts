import z from "zod";

export const LoginSchema = z
  .object({
    email: z.email(),
    password: z.string(),
  })
  .strict();

export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
  role_id: z.number(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
