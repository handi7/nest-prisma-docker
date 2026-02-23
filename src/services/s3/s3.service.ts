import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/common/dtos/env-config.dto";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  readonly bucket: string;

  constructor(private readonly env: ConfigService<EnvConfig>) {
    this.bucket = this.env.get("S3_BUCKET", { infer: true })!;

    this.client = new S3Client({
      region: this.env.get("S3_REGION", { infer: true }) || "us-east-1",
      endpoint: this.env.get("S3_ENDPOINT", { infer: true }), // isi kalau MinIO
      credentials: {
        accessKeyId: this.env.get("S3_ACCESS_KEY", { infer: true })!,
        secretAccessKey: this.env.get("S3_SECRET_KEY", { infer: true })!,
      },
      forcePathStyle: true, // WAJIB kalau MinIO
    });
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    const publicEndpoint = this.env.get("S3_ENDPOINT", { infer: true })!;

    return `${publicEndpoint}/${this.bucket}/${key}`;
  }
}
