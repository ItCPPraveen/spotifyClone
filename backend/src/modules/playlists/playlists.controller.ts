import { Controller, Get, Post, Delete, Body, Param, Request } from '@nestjs/common';
import { PlaylistsService, CreatePlaylistDto, ImportPlaylistDto } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
    constructor(private playlistsService: PlaylistsService) { }

    private getUserId(req: any): string {
        return req.user?.id || req.headers['x-device-id'] || 'anonymous_user';
    }

    @Post()
    async createPlaylist(@Request() req: any, @Body() dto: CreatePlaylistDto) {
        const userId = this.getUserId(req);
        return this.playlistsService.createPlaylist(userId, dto);
    }

    @Get()
    async getUserPlaylists(@Request() req: any) {
        const userId = this.getUserId(req);
        return this.playlistsService.getUserPlaylists(userId);
    }

    @Get(':id')
    async getPlaylist(@Param('id') id: string) {
        return this.playlistsService.getPlaylist(id);
    }

    @Post('import')
    async importPlaylist(@Request() req: any, @Body() dto: ImportPlaylistDto) {
        const userId = this.getUserId(req);
        return this.playlistsService.importPlaylist(userId, dto);
    }

    @Post(':id/songs/:songId')
    async addSongToPlaylist(@Param('id') playlistId: string, @Param('songId') songId: string) {
        return this.playlistsService.addSongToPlaylist(playlistId, songId);
    }

    @Delete(':id/songs/:songId')
    async removeSongFromPlaylist(@Param('id') playlistId: string, @Param('songId') songId: string) {
        return this.playlistsService.removeSongFromPlaylist(playlistId, songId);
    }

    @Delete(':id')
    async deletePlaylist(@Param('id') id: string) {
        await this.playlistsService.deletePlaylist(id);
        return { message: 'Playlist deleted successfully' };
    }
}
