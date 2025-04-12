import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
