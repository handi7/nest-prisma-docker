import { PrismaClient } from "generated/prisma/client";
import UsersSeeder from "./UsersSeeder";
import PermissionsSeeder from "./PermissionsSeeder";
import RoleSeeder from "./RoleSeeder";
import { SeederFunc } from "../seed";

export const seeders: SeederFunc[] = [PermissionsSeeder, RoleSeeder, UsersSeeder];
