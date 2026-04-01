import { Controller, Get, Post, Delete, Body, Param, Request } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
    constructor(private queueService: QueueService) { }

    private getUserId(req: any): string {
        return req.user?.id || req.headers['x-device-id'] || 'anonymous_user';
    }

    @Get()
    async getQueue(@Request() req: any) {
        return this.queueService.getQueue(this.getUserId(req));
    }

    @Post('add/:songId')
    async addToQueue(@Request() req: any, @Param('songId') songId: string) {
        return this.queueService.addToQueue(this.getUserId(req), songId);
    }

    @Delete('remove/:songId')
    async removeFromQueue(@Request() req: any, @Param('songId') songId: string) {
        return this.queueService.removeFromQueue(this.getUserId(req), songId);
    }

    @Delete('clear')
    async clearQueue(@Request() req: any) {
        await this.queueService.clearQueue(this.getUserId(req));
        return { message: 'Queue cleared' };
    }

    @Post('replace')
    async replaceQueue(@Request() req: any, @Body() body: { songIds: string[] }) {
        return this.queueService.replaceQueue(this.getUserId(req), body.songIds);
    }

    @Post('add-multiple')
    async addMultipleToQueue(@Request() req: any, @Body() body: { songIds: string[] }) {
        return this.queueService.addMultipleToQueue(this.getUserId(req), body.songIds);
    }

    @Post('play/:songId')
    async setCurrentSong(@Request() req: any, @Param('songId') songId: string) {
        return this.queueService.setCurrentSong(this.getUserId(req), songId);
    }

    @Post('sleep-timer')
    async setSleepTimer(
        @Request() req: any,
        @Body() dto: { duration_minutes: number },
    ) {
        const durationMs = dto.duration_minutes * 60 * 1000;
        return this.queueService.setSleepTimer(this.getUserId(req), durationMs);
    }

    @Get('sleep-timer')
    async getSleepTimer(@Request() req: any) {
        return this.queueService.getSleepTimer(this.getUserId(req));
    }

}
