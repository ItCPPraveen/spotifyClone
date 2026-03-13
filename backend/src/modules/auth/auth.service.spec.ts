import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { SpotifyService } from '@services/spotify.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
    let service: AuthService;
    let mockUserModel: any;
    let mockJwtService: any;
    let mockSpotifyService: any;
    let mockConfigService: any;

    beforeEach(async () => {
        mockUserModel = {
            findOne: jest.fn(),
            create: jest.fn(),
        };

        mockJwtService = {
            sign: jest.fn().mockReturnValue('jwt-token'),
        };

        mockSpotifyService = {
            getUserProfile: jest.fn(),
        };

        mockConfigService = {
            get: jest.fn((key: string) => {
                const config: any = {
                    SPOTIFY_CLIENT_ID: 'client-id',
                    SPOTIFY_CLIENT_SECRET: 'secret',
                    SPOTIFY_REDIRECT_URI: 'http://localhost:3001/auth/spotify/callback',
                };
                return config[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: SpotifyService,
                    useValue: mockSpotifyService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('refreshToken', () => {
        it('should throw error if user not found', async () => {
            mockUserModel.findOne.mockResolvedValue(null);

            await expect(service.refreshToken('invalid-id')).rejects.toThrow();
        });
    });

    describe('getAuthUrl', () => {
        it('should return Spotify authorization URL', () => {
            const result = service.getAuthUrl();

            expect(result.auth_url).toContain('accounts.spotify.com/authorize');
            expect(result.auth_url).toContain('client_id=client-id');
        });
    });
});
