import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueueDocument = Queue & Document;

@Schema({ timestamps: true })
export class Queue {
    @Prop({ required: true })
    user_id!: string;

    @Prop({ type: [Types.ObjectId], ref: 'Song', default: [] })
    songs!: Types.ObjectId[];

    @Prop({ default: 0 })
    current_index!: number;

    @Prop()
    current_playing_id?: Types.ObjectId;

    @Prop({ default: true })
    is_active!: boolean;

    @Prop({ default: null })
    session_expires_at?: Date;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);
QueueSchema.index({ user_id: 1 });
QueueSchema.index({ is_active: 1 });
