import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Queue, QueueSchema } from './schemas/queue.schema';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Queue.name, schema: QueueSchema }
        ]),
    ],
    controllers: [QueueController],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule { }
