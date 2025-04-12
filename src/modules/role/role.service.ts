import { Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRoleDto: CreateRoleDto) {
    return "This action adds a new role";
  }

  findAll() {
    return this.prisma.role.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
