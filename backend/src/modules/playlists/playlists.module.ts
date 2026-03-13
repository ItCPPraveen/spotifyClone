import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { Song, SongSchema } from '../songs/schemas/song.schema';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { SpotifyService } from '@services/spotify.service';
import { DeezerService } from '@services/deezer.service';
import { SearchMapService } from '@services/search-map.service';
import { YouTubeService } from '@services/youtube.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Playlist.name, schema: PlaylistSchema },
            { name: Song.name, schema: SongSchema },
        ]),
    ],
    controllers: [PlaylistsController],
    providers: [PlaylistsService, SpotifyService, DeezerService, SearchMapService, YouTubeService],
    exports: [PlaylistsService],
})
export class PlaylistsModule { }
