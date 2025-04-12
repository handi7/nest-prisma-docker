import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { STATUS_CODES } from "http";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    const logger = new Logger();

    return next.handle().pipe(
      map((data) => {
        const logMessage = `${request.originalUrl} --> ${statusCode} ${STATUS_CODES[statusCode]}`;
        logger.log(logMessage, request.method);

        return {
          method: request.method,
          path: request.url,
          timestamp: new Date().toISOString(),
          statusCode,
          success: true,
          data,
          error: null,
        };
      }),
      catchError((err) => {
        const statusCode = err instanceof HttpException ? err.getStatus() : 500;

        const isErrorValidation = Boolean(err.response?.validation);

        if (isErrorValidation && !request.originalUrl.startsWith("/auth")) {
          logger.log(request.body, "REQUEST");
        }

        const logMessage = `${request.originalUrl} --> ${statusCode} ${err.message}`;
        const stack = err.response || err.stack;
        logger.error(logMessage, stack, request.method);

        const error = {
          type: STATUS_CODES?.[statusCode] || err.response?.error || err.name || "Error",
          message: statusCode === 500 ? "Internal Server Error" : err.message,
          errors: err.response?.validation || null,
        };

        const errorResponse = {
          method: request.method,
          path: request.url,
          timestamp: new Date().toISOString(),
          statusCode,
          success: false,
          data: null,
          error,
        };
        return throwError(() => new HttpException(errorResponse, statusCode));
      }),
    );
  }
}
