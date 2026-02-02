import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../utils/prisma.service";

const ALLOWED_USERNAMES = new Set(["finance", "sales"]);

@Injectable()
export class UsernameGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headerValue = request.headers?.["x-username"];
    const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const username = raw ? String(raw).trim() : "";

    if (!username) {
      throw new UnauthorizedException("Missing username");
    }
    if (!ALLOWED_USERNAMES.has(username)) {
      throw new UnauthorizedException("Invalid username");
    }

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new UnauthorizedException("Invalid username");
    }

    request.user = { id: user.id, username: user.username };
    return true;
  }
}
