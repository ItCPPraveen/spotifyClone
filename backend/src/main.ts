import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3001;
    const corsOriginConfig = configService.get<string>('CORS_ORIGIN');
    
    // Support multiple origins natively or via comma-separated ENV string
    const corsOrigins = corsOriginConfig 
        ? corsOriginConfig.split(',').map(o => o.trim()) 
        : ['http://localhost:4200', 'https://spotifyhehe-frontend.onrender.com'];

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
    });

    app.setGlobalPrefix('api');

    await app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📖 API available at http://localhost:${port}/api`);
    });
}

bootstrap();
