import { Controller, Get, Post, Delete, Body, Param, Request } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
    constructor(private queueService: QueueService) { }

    @Get()
    async getQueue(@Request() req: any) {
        const userId = req.user?.id || 'anonymous_user';
        return this.queueService.getQueue(userId);
    }

    @Post('add/:songId')
    async addToQueue(@Request() req: any, @Param('songId') songId: string) {
        const userId = req.user?.id || 'anonymous_user';
        return this.queueService.addToQueue(userId, songId);
    }

    @Delete('remove/:songId')
    async removeFromQueue(@Request() req: any, @Param('songId') songId: string) {
        const userId = req.user?.id || 'anonymous_user';
        return this.queueService.removeFromQueue(userId, songId);
    }

    @Delete('clear')
    async clearQueue(@Request() req: any) {
        const userId = req.user?.id || 'anonymous_user';
        await this.queueService.clearQueue(userId);
        return { message: 'Queue cleared' };
    }

    @Post('play/:songId')
    async setCurrentSong(@Request() req: any, @Param('songId') songId: string) {
        const userId = req.user?.id || 'anonymous_user';
        return this.queueService.setCurrentSong(userId, songId);
    }

    @Post('sleep-timer')
    async setSleepTimer(
        @Request() req: any,
        @Body() dto: { duration_minutes: number },
    ) {
        const userId = req.user?.id || 'anonymous_user';
        const durationMs = dto.duration_minutes * 60 * 1000;
        return this.queueService.setSleepTimer(userId, durationMs);
    }

    @Get('sleep-timer')
    async getSleepTimer(@Request() req: any) {
        const userId = req.user?.id || 'anonymous_user';
        return this.queueService.getSleepTimer(userId);
    }

}
