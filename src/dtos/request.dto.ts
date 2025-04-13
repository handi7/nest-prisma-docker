import { UserDto } from "./user.dto";

export class RequestDto extends Request {
  user?: UserDto;
  token?: string;
}
