import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";

export const validationError = (message: string, fields?: Record<string, string>) =>
  new BadRequestException({
    error: "ValidationError",
    message,
    fields,
  });

export const forbiddenError = (message: string) =>
  new ForbiddenException({
    error: "Forbidden",
    message,
  });

export const notFoundError = (message: string) =>
  new NotFoundException({
    error: "NotFound",
    message,
  });
