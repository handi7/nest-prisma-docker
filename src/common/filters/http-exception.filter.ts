import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { STATUS_CODES } from "http";
import { colorResponseTime } from "../helpers/ansi-color";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger();

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const startTime = request.startTime;
    const durationMs = startTime
      ? ((process.hrtime(startTime)[0] * 1e9 + process.hrtime(startTime)[1]) / 1e6).toFixed(2)
      : 0;

    const duration = colorResponseTime(Number(durationMs));

    const logMessage = `${request.originalUrl} --> ${status} ${exception.message} ${duration}`;

    if (status >= 500) {
      this.logger.error(logMessage, exception.stack, request.method);
    } else this.logger.error(logMessage, request.method);

    const isErrorValidation = Boolean(exceptionResponse?.response?.validation);

    if (isErrorValidation && !request.originalUrl.startsWith("/auth")) {
      this.logger.error(exceptionResponse?.response, "Validation");
    }

    const errorMessage =
      status === 500
        ? "Internal Server Error"
        : exceptionResponse?.response?.message || exception.message;

    const error = {
      type:
        STATUS_CODES?.[status] || exceptionResponse.response?.error || exception.name || "Error",
      errors: exceptionResponse?.response?.validation || null,
    };

    const responseData = {
      method: request.method,
      route: request.url,
      timestamp: new Date().toISOString(),
      responseTime: `${durationMs}ms`,
      statusCode: status,
      success: false,
      message: errorMessage,
      data: null,
      meta: null,
      error,
    };

    response.status(status).json(responseData);
  }
}
