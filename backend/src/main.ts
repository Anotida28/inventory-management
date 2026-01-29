import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { validationError } from "./common/utils/errors";
import { ApiKeyGuard } from "./common/guards/api-key.guard";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService = app.get(ConfigService);
  app.useGlobalGuards(new ApiKeyGuard(configService));

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
