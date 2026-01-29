import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredKey = this.configService.get<string>("apiKey");
    if (!requiredKey) {
      throw new UnauthorizedException("API key is not configured");
    }

    const request = context.switchToHttp().getRequest();
    const headerValue =
      request.headers?.["x-api-key"] ||
      request.headers?.authorization ||
      request.headers?.Authorization;
    if (!headerValue) {
      throw new UnauthorizedException("Missing API key");
    }

    const providedKey =
      Array.isArray(headerValue) ? headerValue[0] : String(headerValue);
    const normalized =
      providedKey.indexOf(" ") > -1 ? providedKey.split(" ").pop() : providedKey;

    if (!normalized || normalized !== requiredKey) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }
}
