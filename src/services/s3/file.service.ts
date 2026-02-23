import { Injectable } from "@nestjs/common";
import { File } from "generated/prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { S3Service } from "./s3.service";

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async getFileUrl(file: File): Promise<string> {
    if (file.is_public) {
      return this.s3.getPublicUrl(file.key);
    }

    return this.s3.getSignedUrl(file.key);
  }

  async attachUrlToFile(file: File) {
    return {
      ...file,
      url: await this.getFileUrl(file),
    };
  }

  async attachUrlToFiles(files: File[]) {
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.getFileUrl(file),
      })),
    );
  }

  async uploadFile(file: Express.Multer.File, folder: string, options?: { isPublic?: boolean }) {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    try {
      await this.s3.upload(key, file.buffer, file.mimetype);

      const createdFile = await this.prisma.file.create({
        data: {
          key,
          filename: file.originalname,
          mime_type: file.mimetype,
          size: file.size,
          bucket: this.s3.bucket,
          is_public: options?.isPublic || false,
        },
      });

      return await this.attachUrlToFile(createdFile);
    } catch (error) {
      try {
        await this.s3.delete(key);
      } catch (cleanupError) {
        console.warn("Cleanup failed:", cleanupError);
      }

      throw error;
    }
  }

  async deleteFile(fileId: string) {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) return;

      await this.s3.delete(file.key);
      await this.prisma.file.delete({
        where: { id: fileId },
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
