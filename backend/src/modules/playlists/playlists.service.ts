import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';
import { Song, SongDocument } from '../songs/schemas/song.schema';
import { SpotifyService, SpotifyTrack } from '@services/spotify.service';
import { YouTubeService, YouTubeTrack } from '@services/youtube.service';
import { SearchMapService } from '@services/search-map.service';

export interface CreatePlaylistDto {
    name: string;
    description: string;
}

export interface ImportPlaylistDto {
    playlist_url: string;
}

@Injectable()
export class PlaylistsService {
    constructor(
        @InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>,
        @InjectModel(Song.name) private songModel: Model<SongDocument>,
        private spotifyService: SpotifyService,
        private youTubeService: YouTubeService,
        private searchMapService: SearchMapService,
    ) { }

    async createPlaylist(userId: string, dto: CreatePlaylistDto): Promise<Playlist> {
        const playlist = await this.playlistModel.create({
            name: dto.name,
            description: dto.description,
            owner: userId,
            songs: [],
            is_imported: false,
        });

        return playlist;
    }

    async getUserPlaylists(userId: string): Promise<Playlist[]> {
        return this.playlistModel
            .find({ owner: userId })
            .populate('songs')
            .sort({ createdAt: -1 })
            .exec();
    }

    async getPlaylist(playlistId: string): Promise<Playlist> {
        const playlist = await this.playlistModel
            .findById(playlistId)
            .populate('songs')
            .exec();

        if (!playlist) {
            throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
        }

        return playlist;
    }

    async importPlaylist(
        userId: string,
        dto: ImportPlaylistDto,
    ): Promise<{
        playlist: Playlist;
        imported_count: number;
        duplicate_count: number;
    }> {
        let playlistData: any;
        let tracks: any[] | SpotifyTrack[] | YouTubeTrack[];
        let source: 'spotify' | 'youtube';

        // Determine API source and extract ID
        if (dto.playlist_url.includes('spotify')) {
            const playlistId = this.spotifyService.extractPlaylistId(dto.playlist_url);
            playlistData = await this.spotifyService.getPlaylist(playlistId);
            tracks = await this.spotifyService.getPlaylistTracks(playlistId);
            source = 'spotify';
        } else if (dto.playlist_url.includes('youtube') || dto.playlist_url.includes('youtu.be')) {
            const playlistId = this.youTubeService.extractPlaylistId(dto.playlist_url);
            playlistData = await this.youTubeService.getPlaylist(playlistId);
            tracks = await this.youTubeService.getPlaylistTracks(playlistId);
            source = 'youtube';
        } else {
            throw new BadRequestException('Unsupported playlist URL');
        }

        // Import songs
        const importedSongs = await this.searchMapService.importSongsFromTracks(tracks, source);

        // Count duplicates (songs that already existed)
        const songIds = new Set<string>();
        let duplicateCount = 0;

        for (const song of importedSongs) {
            if (songIds.has((song as any)._id.toString())) {
                duplicateCount++;
            } else {
                songIds.add((song as any)._id.toString());
            }
        }

        // Create playlist
        const totalDuration = importedSongs.reduce((sum, song) => {
            const duration = (song as any).duration_ms || 0;
            return sum + duration;
        }, 0);

        const playlist = await this.playlistModel.create({
            name: playlistData.name || 'Imported Playlist',
            description: playlistData.description || '',
            owner: userId,
            songs: Array.from(songIds).map((id) => new Types.ObjectId(id)),
            is_imported: true,
            source,
            original_url: dto.playlist_url,
            image_url:
                playlistData.images?.[0]?.url ||
                playlistData.picture ||
                playlistData.thumbnail ||
                undefined,
            song_count: importedSongs.length - duplicateCount,
            total_duration_ms: totalDuration,
        });

        return {
            playlist,
            imported_count: importedSongs.length - duplicateCount,
            duplicate_count: duplicateCount,
        };
    }

    async addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist> {
        const playlist = await this.playlistModel.findById(playlistId);
        if (!playlist) {
            throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
        }

        const song = await this.songModel.findById(songId);
        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        if (!playlist.songs.includes(new Types.ObjectId(songId))) {
            playlist.songs.push(new Types.ObjectId(songId));
            playlist.song_count = playlist.songs.length;
            playlist.total_duration_ms = (playlist.total_duration_ms || 0) + song.duration_ms;
            await playlist.save();
        }

        return playlist;
    }

    async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist> {
        const playlist = await this.playlistModel.findById(playlistId);
        if (!playlist) {
            throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
        }

        const song = await this.songModel.findById(songId);
        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        playlist.songs = playlist.songs.filter((id) => id.toString() !== songId);
        playlist.song_count = playlist.songs.length;
        playlist.total_duration_ms = Math.max(0, (playlist.total_duration_ms || 0) - song.duration_ms);
        await playlist.save();

        return playlist;
    }

    async deletePlaylist(playlistId: string): Promise<void> {
        const result = await this.playlistModel.findByIdAndDelete(playlistId);
        if (!result) {
            throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
        }
    }
}
