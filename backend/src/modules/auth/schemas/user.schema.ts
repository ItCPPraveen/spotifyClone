import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    google_id!: string;

    @Prop({ required: true })
    username!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop()
    display_name?: string;

    @Prop()
    profile_image?: string;

    @Prop({ required: true })
    access_token!: string;

    @Prop()
    refresh_token?: string;

    @Prop()
    token_expires_at?: Date;

    @Prop({ type: Date, default: () => new Date() })
    last_login!: Date;

    @Prop({ default: true })
    is_active!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
