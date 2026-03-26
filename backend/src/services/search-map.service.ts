import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Song, SongDocument } from '../modules/songs/schemas/song.schema';
import { SpotifyService, SpotifyTrack } from './spotify.service';
import { YouTubeService, YouTubeTrack } from './youtube.service';

@Injectable()
export class SearchMapService {
    private readonly logger = new Logger(SearchMapService.name);

    constructor(
        @InjectModel(Song.name) private songModel: Model<SongDocument>,
        private spotifyService: SpotifyService,
        private youTubeService: YouTubeService,
    ) { }

    /**
     * Convert Spotify track to internal Song schema
     */
    mapSpotifyTrackToSong(track: SpotifyTrack): Partial<Song> {
        return {
            title: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            album: track.album?.name,
            cover_url: track.album?.images[0]?.url,
            duration_ms: track.duration_ms,
            spotify_id: track.id,
            api_source: 'spotify',
            preview_url: track.preview_url,
            popularity: track.popularity,
            isrc: track.external_ids?.isrc,
            cached_at: new Date(),
            cache_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }

    /**
     * Convert YouTube track to internal Song schema
     */
    mapYouTubeTrackToSong(track: YouTubeTrack): Partial<Song> {
        const thumbnailUrl =
            track.thumbnails?.maxres?.url ||
            track.thumbnails?.high?.url ||
            track.thumbnails?.default?.url ||
            undefined;

        return {
            title: track.title,
            artist: track.channelTitle,
            album: undefined,
            cover_url: thumbnailUrl,
            duration_ms: track.durationMs,
            youtube_id: track.id,
            api_source: 'youtube',
            preview_url: `https://www.youtube.com/watch?v=${track.id}`,
            popularity: track.viewCount,
            cached_at: new Date(),
            cache_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }

    /**
     * Search across local cache first, then external APIs
     */
    async searchSongs(
        query: string,
        limit: number = 20,
    ): Promise<{
        songs: Song[];
        sources: string[];
    }> {
        try {
            // 1. Check local MongoDB cache
            let cachedSongs = await this.songModel
                .find({
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { artist: { $regex: query, $options: 'i' } },
                    ],
                    cache_expires_at: { $gt: new Date() },
                })
                .limit(limit)
                .exec();

            const sources = ['mongodb_cache'];
            const songMap = new Map<string, Song>();

            // Add cached songs to map
            cachedSongs.forEach((song) => {
                const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
                songMap.set(key, song);
            });

            // 2. Fetch from YouTube first (primary source)
            if (songMap.size < limit) {
                try {
                    const youTubeTracks = await this.youTubeService.searchTracks(query, limit - songMap.size);
                    for (const track of youTubeTracks) {
                        const key = `${track.title.toLowerCase()}|${track.channelTitle.toLowerCase()}`;
                        if (!songMap.has(key)) {
                            const mapped = this.mapYouTubeTrackToSong(track);
                            try {
                                const saved = await this.songModel.findOneAndUpdate(
                                    { youtube_id: track.id },
                                    { $setOnInsert: mapped },
                                    { upsert: true, new: true },
                                );
                                songMap.set(key, saved);
                            } catch (createErr) {
                                this.logger.error(`Failed to upsert Song for track ${track.title}`, createErr);
                            }
                        }
                    }
                    sources.push('youtube');
                } catch (error) {
                    this.logger.error('YouTube search failed, trying Spotify', error);
                }
            }

            // 3. Fetch from Spotify if needed
            if (songMap.size < limit) {
                try {
                    const spotifyTracks = await this.spotifyService.searchTracks(query, limit - songMap.size);
                    for (const track of spotifyTracks) {
                        const key = `${track.name.toLowerCase()}|${track.artists[0]?.name.toLowerCase()}`;
                        if (!songMap.has(key)) {
                            const mapped = this.mapSpotifyTrackToSong(track);
                            try {
                                const saved = await this.songModel.findOneAndUpdate(
                                    { spotify_id: track.id },
                                    { $setOnInsert: mapped },
                                    { upsert: true, new: true },
                                );
                                songMap.set(key, saved);
                            } catch (createErr) {
                                this.logger.error(`Failed to upsert Song for track ${track.name}`, createErr);
                            }
                        }
                    }
                    sources.push('spotify');
                } catch (error) {
                    this.logger.error('Spotify search failed', error);
                }
            }

            return {
                songs: Array.from(songMap.values()).slice(0, limit),
                sources: [...new Set(sources)],
            };
        } catch (error) {
            this.logger.error('Search failed:', error);
            throw error;
        }
    }

    /**
     * Batch import songs from external sources
     */
    async importSongsFromTracks(
        tracks: SpotifyTrack[] | YouTubeTrack[],
        source: 'spotify' | 'youtube',
    ): Promise<Song[]> {
        const songs = [];
        for (const track of tracks) {
            const mapped =
                source === 'spotify'
                    ? this.mapSpotifyTrackToSong(track as SpotifyTrack)
                    : this.mapYouTubeTrackToSong(track as YouTubeTrack);

            const orConditions = [];
            if (mapped.spotify_id) orConditions.push({ spotify_id: mapped.spotify_id });
            if (mapped.youtube_id) orConditions.push({ youtube_id: mapped.youtube_id });

            let existing = null;
            if (orConditions.length > 0) {
                existing = await this.songModel.findOne({ $or: orConditions });
            }

            if (!existing) {
                const saved = await this.songModel.create(mapped);
                songs.push(saved);
            } else {
                songs.push(existing);
            }
        }
        return songs;
    }
}
