import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../services/prisma/prisma.service";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const permissions = await this.prisma.permission.findMany();

      type GroupedItem = Record<string, { category: string; items: typeof permissions }>;

      const grouped = permissions.reduce((acc, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = {
            category: curr.category,
            items: [],
          };
        }
        acc[curr.category].items.push(curr);
        return acc;
      }, {} as GroupedItem);

      return Object.values(grouped);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
