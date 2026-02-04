import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../common/utils/prisma.service';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async validateUser(username: string, password: string) {
    // Step 1: Check local database first
    try {
      console.log('Checking local database for username:', username);
      const user = await this.prisma.user.findUnique({ 
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
          role: true,
          createdBy: true,
        }
      });

      if (user) {
        console.log('User found in local database');
        // Validate password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
          console.log('Password mismatch for local user');
          return null;
        }

        // Update last login timestamp
        await this.prisma.user.update({
          where: { username },
          data: { lastLogin: new Date() },
        });

        // Determine source based on createdBy field
        const source = user.createdBy === 'George Jnr Maliseni' 
          ? 'localAdmin' 
          : 'local';

        console.log('Local authentication successful, source:', source);
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          source,
        };
      }

      console.log('User not found in local database, falling back to AD');
    } catch (error) {
      console.error('Local database check error:', error);
      // Continue to AD authentication on error
    }

    // Step 2: Fall back to Active Directory
    try {
      const adConfig = {
        apiUrl: this.configService.get<string>('ad.apiUrl'),
        username: this.configService.get<string>('ad.username'),
        password: this.configService.get<string>('ad.password'),
      };

      const authHeader = `Basic ${Buffer.from(`${adConfig.username}:${adConfig.password}`).toString('base64')}`;

      console.log('Attempting AD authentication for:', username);
      const response = await firstValueFrom(
        this.httpService.post(
          adConfig.apiUrl,
          { data: { username, password } },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        )
      );

      console.log('AD authentication successful');
      return {
        username,
        source: 'ad',
        adData: response.data,
      };
    } catch (error) {
      console.error('AD authentication error:', error?.response?.data || error.message);
      return null;
    }
  }
}
