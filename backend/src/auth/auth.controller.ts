import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const username = dto.username.trim();
    const password = dto.password;
    
    // Forward to external auth service and return response directly
    return this.authService.validateUser(username, password);
  }
}
