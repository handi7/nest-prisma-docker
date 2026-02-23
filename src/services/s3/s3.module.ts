import { Global, Module } from "@nestjs/common";

import { FileService } from "./file.service";
import { S3Service } from "./s3.service";

@Global()
@Module({
  providers: [S3Service, FileService],
  exports: [FileService],
})
export class S3Module {}
