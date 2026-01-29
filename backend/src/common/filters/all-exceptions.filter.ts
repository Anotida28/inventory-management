import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let payload: Record<string, any> = {
      error: "InternalServerError",
      message: "Unexpected error",
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        payload = { error: exception.name, message: res };
      } else if (typeof res === "object" && res !== null) {
        const responseObj = res as Record<string, any>;
        payload = {
          error: responseObj.error || exception.name,
          message: responseObj.message || exception.message,
          fields: responseObj.fields,
        };
      }
    } else if (exception instanceof Error) {
      payload = { error: exception.name, message: exception.message };
    }

    response.status(status).json(payload);
  }
}
