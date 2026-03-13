import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Song, SongSchema } from './schemas/song.schema';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { SpotifyService } from '@services/spotify.service';
import { YouTubeService } from '@services/youtube.service';
import { SearchMapService } from '@services/search-map.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }])],
    controllers: [SongsController],
    providers: [SongsService, SpotifyService, YouTubeService, SearchMapService],
    exports: [SongsService, SearchMapService],
})
export class SongsModule { }
