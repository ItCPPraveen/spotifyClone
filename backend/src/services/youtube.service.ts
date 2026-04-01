import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface YouTubeTrack {
    id: string;
    title: string;
    channelTitle: string;
    thumbnails: { [key: string]: { url: string } };
    durationMs: number;
    viewCount: number;
}

@Injectable()
export class YouTubeService {
    private readonly logger = new Logger(YouTubeService.name);
    private readonly client: AxiosInstance;
    private readonly apiKey: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
        console.log('this.apiKey', this.apiKey);
        if (!this.apiKey) {
            this.logger.warn('YOUTUBE_API_KEY is not set; YouTube search will fail.');
        }

        this.client = axios.create({
            baseURL: 'https://www.googleapis.com/youtube/v3',
        });
    }

    async searchTracks(query: string, limit: number = 20): Promise<YouTubeTrack[]> {
        if (!this.apiKey || this.apiKey === 'your_youtube_api_key') {
            this.logger.warn('Skipping YouTube search: YOUTUBE_API_KEY is not set or is invalid.');
            return [];
        }

        try {
            const searchRes = await this.client.get('/search', {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: limit,
                    key: this.apiKey,
                },
            });

            const videoIds = searchRes.data.items.map((item: any) => item.id.videoId).filter(Boolean);
            if (!videoIds.length) {
                return [];
            }

            console.log('videoIds', videoIds);

            const videosRes = await this.client.get('/videos', {
                params: {
                    part: 'snippet,contentDetails,statistics',
                    id: videoIds.join(','),
                    key: this.apiKey,
                },
            });

            return videosRes.data.items.map((item: any) => {
                const duration = item.contentDetails?.duration;
                const durationMs = this.parseIsoDuration(duration);

                return {
                    id: item.id,
                    title: item.snippet?.title || 'Unknown',
                    channelTitle: item.snippet?.channelTitle || 'Unknown',
                    thumbnails: item.snippet?.thumbnails || {},
                    durationMs,
                    viewCount: parseInt(item.statistics?.viewCount || '0', 10),
                };
            });
        } catch (error) {
            this.logger.error('YouTube track search failed:', error);
            throw new HttpException('YouTube API error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async searchPlaylists(query: string, limit: number = 8): Promise<any[]> {
        if (!this.apiKey || this.apiKey === 'your_youtube_api_key') {
            this.logger.warn('Skipping YouTube playlist search: API Key not set.');
            return [];
        }

        try {
            const searchRes = await this.client.get('/search', {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'playlist',
                    maxResults: limit,
                    key: this.apiKey,
                },
            });

            return searchRes.data.items.map((item: any) => ({
                id: item.id?.playlistId,
                title: item.snippet?.title || 'Unknown',
                channelTitle: item.snippet?.channelTitle || 'Unknown',
                thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
            }));
        } catch (error) {
            this.logger.error('YouTube playlist search failed:', error);
            throw new HttpException('YouTube API error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPlaylist(playlistId: string): Promise<{
        id: string;
        title: string;
        description?: string;
        thumbnail?: string;
    }> {
        try {
            const response = await this.client.get('/playlists', {
                params: {
                    part: 'snippet',
                    id: playlistId,
                    key: this.apiKey,
                },
            });

            const playlist = response.data.items?.[0];
            if (!playlist) {
                throw new Error('Playlist not found');
            }

            return {
                id: playlist.id,
                title: playlist.snippet?.title || 'YouTube Playlist',
                description: playlist.snippet?.description,
                thumbnail: playlist.snippet?.thumbnails?.default?.url,
            };
        } catch (error) {
            this.logger.error('Failed to fetch YouTube playlist:', error);
            throw new HttpException('YouTube API error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPlaylistTracks(playlistId: string): Promise<YouTubeTrack[]> {
        try {
            const allVideoIds: string[] = [];
            let nextPageToken: string | undefined;

            do {
                const res = await this.client.get('/playlistItems', {
                    params: {
                        part: 'snippet',
                        playlistId,
                        maxResults: 50,
                        pageToken: nextPageToken,
                        key: this.apiKey,
                    },
                });

                const items = res.data.items || [];
                items.forEach((item: any) => {
                    const videoId = item.snippet?.resourceId?.videoId;
                    if (videoId) {
                        allVideoIds.push(videoId);
                    }
                });

                nextPageToken = res.data.nextPageToken;
            } while (nextPageToken);

            if (!allVideoIds.length) {
                return [];
            }

            const chunks: string[][] = [];
            for (let i = 0; i < allVideoIds.length; i += 50) {
                chunks.push(allVideoIds.slice(i, i + 50));
            }

            const tracks: YouTubeTrack[] = [];
            for (const chunk of chunks) {
                const videosRes = await this.client.get('/videos', {
                    params: {
                        part: 'snippet,contentDetails,statistics',
                        id: chunk.join(','),
                        key: this.apiKey,
                    },
                });

                tracks.push(
                    ...videosRes.data.items.map((item: any) => {
                        const duration = item.contentDetails?.duration;
                        const durationMs = this.parseIsoDuration(duration);

                        return {
                            id: item.id,
                            title: item.snippet?.title || 'Unknown',
                            channelTitle: item.snippet?.channelTitle || 'Unknown',
                            thumbnails: item.snippet?.thumbnails || {},
                            durationMs,
                            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
                        };
                    }),
                );
            }

            return tracks;
        } catch (error) {
            this.logger.error('Failed to fetch YouTube playlist tracks:', error);
            throw new HttpException('YouTube API error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    extractPlaylistId(url: string): string {
        const match = url.match(/(?:list=)([A-Za-z0-9_-]+)/);
        if (!match) {
            throw new HttpException('Invalid YouTube playlist URL', HttpStatus.BAD_REQUEST);
        }

        return match[1];
    }

    private parseIsoDuration(duration?: string): number {
        if (!duration) {
            return 0;
        }

        // Example: PT3M45S
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = duration.match(regex);
        if (!matches) {
            return 0;
        }

        const hours = parseInt(matches[1] || '0', 10);
        const minutes = parseInt(matches[2] || '0', 10);
        const seconds = parseInt(matches[3] || '0', 10);

        return ((hours * 60 + minutes) * 60 + seconds) * 1000;
    }
}
