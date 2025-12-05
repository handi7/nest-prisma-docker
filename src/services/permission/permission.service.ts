import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { mapToGroupedPermissions } from "./permission.mapper";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(args?: { grouped?: boolean }) {
    const permissions = await this.prisma.permission.findMany({});

    if (args.grouped) {
      return mapToGroupedPermissions(permissions);
    }

    return permissions;
  }
}
