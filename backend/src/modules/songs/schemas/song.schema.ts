import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SongDocument = Song & Document;

@Schema({ timestamps: true })
export class Song {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    artist!: string;

    @Prop()
    album?: string;

    @Prop()
    cover_url?: string;

    @Prop({ required: true })
    duration_ms!: number;

    @Prop()
    spotify_id?: string;

    @Prop()
    youtube_id?: string;

    @Prop({ enum: ['spotify', 'youtube', 'internal'], default: 'youtube' })
    api_source!: string;

    @Prop()
    preview_url?: string;

    @Prop({ default: 0 })
    popularity!: number;

    @Prop({ index: true })
    isrc?: string;

    @Prop({ type: Date, default: () => new Date() })
    cached_at!: Date;

    @Prop({ type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) })
    cache_expires_at!: Date;
}

export const SongSchema = SchemaFactory.createForClass(Song);
SongSchema.index({ title: 1, artist: 1 });
// sparse: true means null values are excluded from the index,
// preventing E11000 duplicate key errors when multiple songs lack a spotify_id or youtube_id
SongSchema.index({ spotify_id: 1 }, { unique: true, sparse: true });
SongSchema.index({ youtube_id: 1 }, { unique: true, sparse: true });
SongSchema.index({ cache_expires_at: 1 });
