import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Spotify Clone Backend v1.0.0';
    }
}
