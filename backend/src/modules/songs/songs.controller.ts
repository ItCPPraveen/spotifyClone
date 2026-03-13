import { Controller, Get, Query, Param } from '@nestjs/common';
import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {
    constructor(private songsService: SongsService) { }

    @Get('search')
    async searchSongs(
        @Query('q') query: string,
        @Query('limit') limit: string = '20',
    ) {
        const parsedLimit = Math.min(parseInt(limit, 10), 100);
        return this.songsService.searchSongs(query, parsedLimit);
    }

    @Get('recent')
    async getRecentSongs(@Query('limit') limit: string = '50') {
        const parsedLimit = Math.min(parseInt(limit, 10), 100);
        return this.songsService.getRecentSongs(parsedLimit);
    }

    @Get(':id')
    async getSongById(@Param('id') id: string) {
        return this.songsService.getSongById(id);
    }

    @Get('cache/stats')
    async getCacheStats() {
        return this.songsService.getCacheStats();
    }
}
