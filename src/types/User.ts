import { User as PUser } from "generated/prisma/client";
import { Role } from "./Role";

export interface User extends Omit<PUser, "password"> {
  password?: string;
  role?: Role;
}
