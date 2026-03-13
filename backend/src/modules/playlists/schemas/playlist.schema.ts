import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlaylistDocument = Playlist & Document;

@Schema({ timestamps: true })
export class Playlist {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    owner!: string;

    @Prop({ type: [Types.ObjectId], ref: 'Song', default: [] })
    songs!: Types.ObjectId[];

    @Prop({ default: false })
    is_imported!: boolean;

    @Prop()
    original_url?: string;

    @Prop({ enum: ['spotify', 'youtube', 'manual'] })
    source?: string;

    @Prop({ default: '' })
    description?: string;

    @Prop({ default: '' })
    image_url?: string;

    @Prop({ default: 0 })
    total_duration_ms?: number;

    @Prop({ default: 0 })
    song_count?: number;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
PlaylistSchema.index({ owner: 1 });
PlaylistSchema.index({ name: 1 });
PlaylistSchema.index({ is_imported: 1 });
