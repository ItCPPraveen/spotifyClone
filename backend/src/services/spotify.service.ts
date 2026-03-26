import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
    duration_ms: number;
    external_ids?: { isrc: string };
    preview_url: string;
    popularity: number;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    images: Array<{ url: string }>;
    tracks: {
        total: number;
        items: Array<{ track: SpotifyTrack }>;
        next: string | null;
    };
    owner: { display_name: string };
}

@Injectable()
export class SpotifyService {
    private readonly logger = new Logger(SpotifyService.name);
    private readonly client: AxiosInstance;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private accessToken?: string;
    private tokenExpiry?: number;

    constructor(private configService: ConfigService) {
        this.clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID')!;
        this.clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET')!;

        this.client = axios.create({
            baseURL: 'https://api.spotify.com/v1',
            headers: {
                'User-Agent': 'Spotify-Clone/1.0',
            },
        });

        this.client.interceptors.response.use(
            (response) => response,
            this.handleSpotifyError.bind(this),
        );
    }

    private async getClientCredentialsToken(): Promise<string> {
        if (!this.clientId || this.clientId === 'your_spotify_client_id' || !this.clientSecret || this.clientSecret === 'your_spotify_client_secret') {
            this.logger.warn('Skipping Spotify auth: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set or invalid.');
            throw new HttpException('Spotify credentials not configured', HttpStatus.NOT_IMPLEMENTED);
        }

        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios.post('https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        Authorization: `Basic ${authString}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
            return this.accessToken || '';
        } catch (error) {
            this.logger.error('Failed to get Spotify token:', error);
            throw new HttpException(
                'Failed to authenticate with Spotify',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
        try {
            const token = await this.getClientCredentialsToken();
            const response = await this.client.get('/search', {
                params: { q: query, type: 'track', limit },
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data.tracks.items;
        } catch (error) {
            this.logger.error('Spotify track search failed:', error);
            throw error;
        }
    }

    async getPlaylistTracks(playlistId: string, _accessToken?: string): Promise<SpotifyTrack[]> {
        try {
            // Because of Spotify App Development mode restrictions returning 404 for public catalog,
            // we use spotify-url-info scraper to bypass API limit for tracks.
            const _fetch = Reflect.get(globalThis, 'fetch') as any;
            const { getTracks } = require('spotify-url-info')(_fetch);
            const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;
            const scrapedTracks = await getTracks(playlistUrl);
            
            return scrapedTracks.map((t: any) => ({
                id: t.uri ? t.uri.split(':').pop() : '',
                name: t.name,
                artists: [{ name: t.artist || 'Unknown Artist' }],
                album: { name: '', images: [] },
                duration_ms: t.duration || 0,
                preview_url: t.previewUrl || '',
                popularity: 50,
            }));
        } catch (error) {
            this.logger.error('Failed to fetch Spotify playlist tracks via scraper:', error);
            throw error;
        }
    }

    async getPlaylist(playlistId: string, _accessToken?: string): Promise<SpotifyPlaylist> {
        try {
            // Use scraper to bypass App Dev Mode API restrictions
            const _fetch = Reflect.get(globalThis, 'fetch') as any;
            const { getPreview } = require('spotify-url-info')(_fetch);
            const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;
            const preview = await getPreview(playlistUrl);
            
            return {
                id: playlistId,
                name: preview.title || 'Imported Playlist',
                description: preview.description || '',
                images: preview.image ? [{ url: preview.image }] : [],
                tracks: { total: 0, items: [], next: null },
                owner: { display_name: 'Spotify User' }
            };
        } catch (error) {
            this.logger.error('Failed to fetch Spotify playlist via scraper:', error);
            throw error;
        }
    }

    async getUserProfile(accessToken: string) {
        try {
            const response = await this.client.get('/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch user profile:', error);
            throw error;
        }
    }

    extractPlaylistId(url: string): string {
        const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
        if (!match) {
            throw new HttpException('Invalid Spotify playlist URL', HttpStatus.BAD_REQUEST);
        }
        return match[1];
    }

    private async handleSpotifyError(error: any) {
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 30;
            this.logger.warn(`Spotify rate limited. Retry after ${retryAfter}s`);
            throw new HttpException(
                `Rate limited. Try again in ${retryAfter}s`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        if (error.response?.status === 401) {
            throw new HttpException('Invalid Spotify credentials', HttpStatus.UNAUTHORIZED);
        }

        throw error;
    }
}
