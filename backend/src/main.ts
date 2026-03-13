import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3001;
    const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:4200';

    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.setGlobalPrefix('api');

    await app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📖 API available at http://localhost:${port}/api`);
    });
}

bootstrap();
