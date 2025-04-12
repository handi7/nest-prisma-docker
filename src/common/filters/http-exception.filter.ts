import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { STATUS_CODES } from 'http';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger();

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (exceptionResponse?.method) {
      return response.status(status).json(exceptionResponse);
    }

    const logMessage = `${request.originalUrl} --> ${status} ${exception.message}`;
    this.logger.error(logMessage, exceptionResponse, request.method);

    const error = {
      type: STATUS_CODES?.[status] || 'Internal Server Error',
      message:
        typeof exceptionResponse === 'object'
          ? exceptionResponse.message
          : exceptionResponse,
      errors: null,
    };

    response.status(status).json({
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString(),
      statusCode: status,
      success: false,
      data: null,
      error,
    });
  }
}
