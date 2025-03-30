import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { IndexingJobModule } from '../indexing-job/indexing-job.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'indexing',
    }),
    IndexingJobModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {} 