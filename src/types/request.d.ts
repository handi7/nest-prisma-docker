import type { User as AppUser } from "src/types/User";

declare global {
  namespace Express {
    // Passport already declares `Request.user` as `Express.User`; widening that interface
    // (instead of redeclaring `user`) keeps both declarations agreeing on one type.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AppUser {}
  }
}

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
    startTime?: ReturnType<typeof process.hrtime>;
  }
}
