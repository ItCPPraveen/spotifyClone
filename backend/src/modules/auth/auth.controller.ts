import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) { }

    @Get('login')
    async getAuthUrl() {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

        if (!clientId || !redirectUri) {
            throw new BadRequestException('Google OAuth configuration is missing');
        }

        const scopes = [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/youtube.readonly',
        ];

        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scopes.join(' '))}` +
            `&access_type=offline` +
            `&prompt=consent`;

        return { url: authUrl };
    }

    @Post('callback')
    async handleCallback(@Body() dto: { code: string }) {
        return this.authService.handleGoogleCallback(dto.code);
    }

    @Get('profile')
    // @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req: any) {
        if (!req.user?.id) {
            return {
                id: 'anonymous_user',
                google_id: 'local_anon',
                email: 'anon@local.com',
                username: 'Anonymous',
                display_name: 'Guest User',
            };
        }
        return this.authService.getUserProfile(req.user.id);
    }

    @Post('refresh')
    // @UseGuards(JwtAuthGuard)
    async refreshToken(@Request() req: any) {
        if (!req.user?.id) {
            return { access_token: 'dummy_token' };
        }
        const token = await this.authService.refreshToken(req.user.id);
        return { access_token: token };
    }
}
