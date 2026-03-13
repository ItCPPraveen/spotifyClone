import { Injectable, Logger, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import axios from 'axios';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Handle Google OAuth callback
     */
    async handleGoogleCallback(code: string): Promise<{
        access_token: string;
        user: User;
    }> {
        try {
            // Exchange code for token
            const tokenData = await this.exchangeCodeForToken(code);

            // Get user profile from Google
            const googleProfile = await this.getGoogleUserProfile(tokenData.access_token);

            // Find or create user
            let user = await this.userModel.findOne({ google_id: googleProfile.id });

            if (user) {
                user.access_token = tokenData.access_token;
                user.refresh_token = tokenData.refresh_token || user.refresh_token;
                user.token_expires_at = new Date(Date.now() + tokenData.expires_in * 1000);
                user.last_login = new Date();
            } else {
                user = await this.userModel.create({
                    google_id: googleProfile.id,
                    username: googleProfile.name || googleProfile.email,
                    email: googleProfile.email,
                    display_name: googleProfile.name,
                    profile_image: googleProfile.picture,
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
                });
            }

            await user.save();

            // Generate JWT
            const jwt = this.jwtService.sign({
                id: user._id,
                google_id: user.google_id,
                email: user.email,
            });

            return { access_token: jwt, user };
        } catch (error) {
            this.logger.error('Google callback failed:', error);
            throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
        }
    }

    private async exchangeCodeForToken(code: string): Promise<{
        access_token: string;
        refresh_token?: string;
        expires_in: number;
    }> {
        try {
            const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
            const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
            const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

            if (!clientId || !clientSecret || !redirectUri) {
                throw new BadRequestException('Google OAuth configuration is missing');
            }

            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                `code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in,
            };
        } catch (error) {
            this.logger.error('Failed to exchange code for token:', error);
            throw error;
        }
    }

    private async getGoogleUserProfile(accessToken: string): Promise<any> {
        try {
            const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return response.data;
        } catch (error) {
            this.logger.error('Failed to get Google user profile:', error);
            throw error;
        }
    }

    async refreshToken(userId: string): Promise<string> {
        const user = await this.userModel.findById(userId);
        if (!user || !user.refresh_token) {
            throw new HttpException('User or refresh token not found', HttpStatus.NOT_FOUND);
        }

        try {
            const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
            const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

            if (!clientId || !clientSecret) {
                throw new BadRequestException('Google OAuth configuration is missing');
            }

            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                `refresh_token=${encodeURIComponent(user.refresh_token)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=refresh_token`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            user.access_token = response.data.access_token;
            if (response.data.refresh_token) {
                user.refresh_token = response.data.refresh_token;
            }
            user.token_expires_at = new Date(Date.now() + response.data.expires_in * 1000);
            await user.save();

            return this.jwtService.sign({
                id: user._id,
                google_id: user.google_id,
                email: user.email,
            });
        } catch (error) {
            this.logger.error('Token refresh failed:', error);
            throw new HttpException('Failed to refresh token', HttpStatus.UNAUTHORIZED);
        }
    }

    async getUserProfile(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async getAuthUrl(): Promise<{ auth_url: string }> {
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

        const auth_url =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scopes.join(' '))}` +
            `&access_type=offline` +
            `&prompt=consent`;

        return { auth_url };
    }
}
