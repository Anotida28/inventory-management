import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { validationError } from "./common/utils/errors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const fields: Record<string, string> = {};
        errors.forEach((error) => {
          const constraints = error.constraints || {};
          const message = Object.values(constraints).join(", ");
          if (message) fields[error.property] = message;
        });
        return validationError("Validation failed", fields);
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  await app.listen(port);
}

bootstrap();
