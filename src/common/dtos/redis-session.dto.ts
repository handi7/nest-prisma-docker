import { User } from "src/types/User";

export class RedisSession {
  access_token: string;
  refresh_token: string;
  user: User;
}
