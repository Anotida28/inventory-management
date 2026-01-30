"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const errors_1 = require("./common/utils/errors");
const api_key_guard_1 = require("./common/guards/api-key.guard");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    const configService = app.get(config_1.ConfigService);
    app.useGlobalGuards(new api_key_guard_1.ApiKeyGuard(configService));
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const fields = {};
            errors.forEach((error) => {
                const constraints = error.constraints || {};
                const message = Object.values(constraints).join(", ");
                if (message)
                    fields[error.property] = message;
            });
            return (0, errors_1.validationError)("Validation failed", fields);
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const port = process.env.PORT ? Number(process.env.PORT) : 5000;
    await app.listen(port);
}
bootstrap();
