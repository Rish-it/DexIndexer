import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { IndexingJobService } from './indexing-job.service';
import { IndexingJobController } from './indexing-job.controller';
import { IndexingProcessor } from './indexing.processor';
import { HeliusModule } from '../helius/helius.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'indexing',
    }),
    HeliusModule,
  ],
  providers: [IndexingJobService, IndexingProcessor],
  controllers: [IndexingJobController],
  exports: [IndexingJobService],
})
export class IndexingJobModule {} 