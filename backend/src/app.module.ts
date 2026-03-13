import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { SongsModule } from './modules/songs/songs.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { QueueModule } from './modules/queue/queue.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),
        AuthModule,
        SongsModule,
        PlaylistsModule,
        QueueModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
