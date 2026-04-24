import { Seeder } from "../seed";

import PermissionsSeeder from "./PermissionsSeeder";
import RoleSeeder from "./RoleSeeder";
import UsersSeeder from "./UsersSeeder";

export const seeders: Seeder[] = [PermissionsSeeder, RoleSeeder, UsersSeeder];
