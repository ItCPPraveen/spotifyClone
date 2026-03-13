import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Queue, QueueDocument } from './schemas/queue.schema';

@Injectable()
export class QueueService {
    constructor(
        @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    ) { }

    async getOrCreateQueue(userId: string): Promise<QueueDocument> {
        let queue = await this.queueModel.findOne({ user_id: userId, is_active: true });

        if (!queue) {
            queue = await this.queueModel.create({
                user_id: userId,
                songs: [],
                current_index: 0,
                is_active: true,
            });
        }

        return queue;
    }

    async addToQueue(userId: string, songId: string): Promise<QueueDocument> {
        const queue = await this.getOrCreateQueue(userId);

        if (!queue.songs.includes(new Types.ObjectId(songId))) {
            queue.songs.push(new Types.ObjectId(songId));
            
            // Auto-play if it's the first song
            if (queue.songs.length === 1) {
                queue.current_index = 0;
                queue.current_playing_id = new Types.ObjectId(songId);
            }
            await queue.save();
        }

        return this.getQueue(userId);
    }

    async getQueue(userId: string): Promise<QueueDocument> {
        const queue = await this.queueModel
            .findOne({ user_id: userId, is_active: true })
            .populate('songs')
            .populate('current_playing_id');

        if (!queue) {
            throw new HttpException('Queue not found', HttpStatus.NOT_FOUND);
        }

        return queue;
    }

    async clearQueue(userId: string): Promise<void> {
        await this.queueModel.updateOne(
            { user_id: userId, is_active: true },
            { $set: { songs: [], current_index: 0, is_active: false } },
        );
    }

    async removeFromQueue(userId: string, songId: string): Promise<QueueDocument> {
        const queue = await this.getOrCreateQueue(userId);

        queue.songs = queue.songs.filter((id) => id.toString() !== songId);
        if (queue.current_index >= queue.songs.length) {
            queue.current_index = Math.max(0, queue.songs.length - 1);
        }

        await queue.save();
        return this.getQueue(userId);
    }

    async setCurrentSong(userId: string, songId: string): Promise<QueueDocument> {
        const queue = await this.getOrCreateQueue(userId);

        const index = queue.songs.findIndex((id) => id.toString() === songId);
        if (index === -1) {
            throw new HttpException('Song not in queue', HttpStatus.BAD_REQUEST);
        }

        queue.current_index = index;
        queue.current_playing_id = new Types.ObjectId(songId);
        await queue.save();

        return this.getQueue(userId);
    }

    /**
     * Set sleep timer (Redis would cache this in production)
     */
    async setSleepTimer(userId: string, durationMs: number): Promise<{
        expires_at: Date;
    }> {
        const queue = await this.getOrCreateQueue(userId);
        queue.session_expires_at = new Date(Date.now() + durationMs);
        await queue.save();

        return { expires_at: queue.session_expires_at };
    }

    async getSleepTimer(userId: string): Promise<{ remaining_ms: number } | null> {
        const queue = await this.queueModel.findOne({ user_id: userId, is_active: true });

        if (!queue || !queue.session_expires_at) {
            return null;
        }

        const remaining = queue.session_expires_at.getTime() - Date.now();
        if (remaining <= 0) {
            queue.session_expires_at = undefined;
            await queue.save();
            return null;
        }

        return { remaining_ms: remaining };
    }
}

