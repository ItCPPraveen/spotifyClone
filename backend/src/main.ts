import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3001;
    app.enableCors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            // Allow all origins for this project to prevent CORS errors in production
            callback(null, true); 
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'Accept'],
    });

    app.setGlobalPrefix('api');

    await app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📖 API available at http://localhost:${port}/api`);
    });
}

bootstrap();
