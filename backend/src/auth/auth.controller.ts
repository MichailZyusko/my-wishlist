import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() body: { idToken?: string }) {
    if (!body?.idToken) {
      throw new BadRequestException('idToken is required');
    }

    return this.authService.authenticateGoogle(body.idToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: { user: { id: string; email: string; name: string } }) {
    return { user: req.user };
  }
}
