import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/utils/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    // hash later @GeorgeMali//
    if (user.password !== password) return null;
    return user;
  }
}
