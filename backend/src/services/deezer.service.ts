import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface DeezerTrack {
    id: string;
    title: string;
    artist: { name: string };
    album: { title: string; cover: string };
    duration: number;
    preview: string;
    rank: number;
}

export interface DeezerPlaylist {
    id: string;
    title: string;
    description: string;
    picture: string;
    creator: { name: string };
    tracks: { data: DeezerTrack[] };
}

@Injectable()
export class DeezerService {
    private readonly logger = new Logger(DeezerService.name);
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.deezer.com',
        });

        this.client.interceptors.response.use(
            (response) => response,
            this.handleDeezerError.bind(this),
        );
    }

    async searchTracks(query: string, limit: number = 20): Promise<DeezerTrack[]> {
        try {
            const response = await this.client.get('/search', {
                params: { q: query, limit },
            });

            return response.data.data;
        } catch (error) {
            this.logger.error('Deezer track search failed:', error);
            throw error;
        }
    }

    async getPlaylistTracks(playlistId: string): Promise<DeezerTrack[]> {
        try {
            const response = await this.client.get(`/playlist/${playlistId}/tracks`);
            return response.data.data;
        } catch (error) {
            this.logger.error('Failed to fetch Deezer playlist tracks:', error);
            throw error;
        }
    }

    async getPlaylist(playlistId: string): Promise<DeezerPlaylist> {
        try {
            const response = await this.client.get(`/playlist/${playlistId}`);
            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch Deezer playlist:', error);
            throw error;
        }
    }

    extractPlaylistId(url: string): string {
        const match = url.match(/playlist\/(\d+)/);
        if (!match) {
            throw new HttpException('Invalid Deezer playlist URL', HttpStatus.BAD_REQUEST);
        }
        return match[1];
    }

    private async handleDeezerError(error: any) {
        if (error.response?.status === 429) {
            this.logger.warn('Deezer rate limited');
            throw new HttpException(
                'Rate limited by Deezer',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        throw error;
    }
}
