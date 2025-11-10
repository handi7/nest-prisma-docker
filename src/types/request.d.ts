import { User } from "prisma/client";
import { JwtPayload } from "src/dtos/jwt-payload.dto";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
    token?: string;
    decodedToken?: JwtPayload;
    startTime?: ReturnType<typeof process.hrtime>;
  }
}
