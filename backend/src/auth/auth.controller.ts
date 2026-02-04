import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const username = dto.username.trim();
    const password = dto.password;
    const result = await this.authService.validateUser(username, password);
    
    if (!result) {
      throw new UnauthorizedException("Invalid username or password.");
    }

    return {
      status: "success",
      source: result.source,
      user: {
        id: result.id,
        username: result.username,
        role: result.role,
      },
      ...(result.adData && { data: result.adData }),
    };
  }
}
