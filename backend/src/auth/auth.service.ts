import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authApiUrl = 'http://180.10.1.222:3002/authenticate/login';

  constructor(private readonly httpService: HttpService) {}

  async validateUser(username: string, password: string) {
    try {
      console.log('Forwarding authentication request for:', username);
      
      const response = await firstValueFrom(
        this.httpService.post(this.authApiUrl, {
          data: { username, password },
        })
      );

      console.log('Authentication response:', response.data);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || 500;
      const message = error?.response?.data?.message || 'Authentication failed';
      
      console.error('Authentication error:', { status, message });
      
      throw new HttpException(
        { status: 'error', message },
        status
      );
    }
  }
}
