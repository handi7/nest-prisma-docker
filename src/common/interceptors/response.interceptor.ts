import {
  CallHandler,
  ExecutionContext,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, map, Observable, throwError } from "rxjs";
import { Request, Response } from "express";
import { STATUS_CODES } from "http";
import { colorResponseCode, colorResponseTime } from "../helpers/ansi-color";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => this.handleSuccess(request, response, data)),

      catchError((err) => {
        const statusCode = err instanceof HttpException ? err.getStatus() : 500;
        return throwError(() => new HttpException(err, statusCode));
      }),
    );
  }

  private handleSuccess(request: Request, response: Response, data: any) {
    const statusCode = response.statusCode;
    const coloredStatusCode = colorResponseCode(statusCode);
    const status = STATUS_CODES[response.statusCode];

    const startTime = request.startTime;
    const durationMs = startTime
      ? ((process.hrtime(startTime)[0] * 1e9 + process.hrtime(startTime)[1]) / 1e6).toFixed(2)
      : 0;

    const duration = colorResponseTime(Number(durationMs));

    const logMessage = `\x1b[37m${request.originalUrl} \x1b[36m--> ${coloredStatusCode} ${status} ${duration}`;
    this.logger.log(logMessage, request.method);

    const responseData = {
      method: request.method,
      route: request.url,
      timestamp: new Date().toISOString(),
      responseTime: `${durationMs}ms`,
      statusCode: response.statusCode,
      success: true,
      message: HttpStatus[statusCode],
      data: data,
      meta: null,
      error: null,
    };

    if (data?.message) {
      responseData.message = data.message;
    }

    if (data?.data && data?.meta) {
      responseData.data = data.data;
      responseData.meta = data.meta;
    }

    return responseData;
  }
}
