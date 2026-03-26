import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Song, SongDocument } from './schemas/song.schema';
import { SearchMapService } from '@services/search-map.service';

@Injectable()
export class SongsService {
    private readonly logger = new Logger(SongsService.name);

    constructor(
        @InjectModel(Song.name) private songModel: Model<SongDocument>,
        private searchMapService: SearchMapService,
    ) { }

    async searchSongs(query: string, limit: number = 20): Promise<{
        songs: Song[];
        sources: string[];
    }> {
        if (!query || query.trim().length === 0) {
            throw new HttpException('Query cannot be empty', HttpStatus.BAD_REQUEST);
        }

        return this.searchMapService.searchSongs(query, limit);
    }

    async getRecentSongs(limit: number = 50): Promise<Song[]> {
        return this.songModel.find().sort({ cached_at: -1 }).limit(limit).exec();
    }

    async getSongById(id: string): Promise<Song> {
        let song: any = await this.songModel.findById(id);
        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        if (!song.youtube_id && song.api_source === 'spotify') {
            try {
                song = await this.searchMapService.resolveYouTubeId(id);
            } catch (e) {
                this.logger.warn(`Failed to dynamically resolve youtube ID for ${id}`);
            }
        }
        
        return song;
    }

    async getSongsByIds(ids: string[]): Promise<Song[]> {
        return this.songModel.find({ _id: { $in: ids } }).exec();
    }

    async deletExpiredCache(): Promise<number> {
        const result = await this.songModel.deleteMany({
            cache_expires_at: { $lt: new Date() },
        });
        this.logger.log(`Deleted ${result.deletedCount} expired cache entries`);
        return result.deletedCount;
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(): Promise<{
        total_songs: number;
        spotify_songs: number;
        youtube_songs: number;
        expired_count: number;
    }> {
        const total_songs = await this.songModel.countDocuments();
        const spotify_songs = await this.songModel.countDocuments({ api_source: 'spotify' });
        const youtube_songs = await this.songModel.countDocuments({ api_source: 'youtube' });
        const expired_count = await this.songModel.countDocuments({
            cache_expires_at: { $lt: new Date() },
        });

        return {
            total_songs,
            spotify_songs,
            youtube_songs,
            expired_count,
        };
    }
}
