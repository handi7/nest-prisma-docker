import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestTimerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.startTime = process.hrtime(); // high resolution time
    next();
  }
}
