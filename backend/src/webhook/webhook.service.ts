import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { IndexingJobService } from '../indexing-job/indexing-job.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private prisma: PrismaService,
    private indexingJobService: IndexingJobService,
    @InjectQueue('indexing') private indexingQueue: Queue,
  ) {}

  async processWebhook(jobId: string, payload: any) {
    this.logger.log(`Received webhook event for job ID: ${jobId}`);

    try {
      // Log webhook event for debugging and auditing
      await this.prisma.webhookEvent.create({
        data: {
          webhookId: 'direct',
          indexingJobId: jobId,
          payload,
          status: 'received',
        },
      });

      // Get the indexing job
      const indexingJob = await this.indexingJobService.findById(jobId);
      if (!indexingJob) {
        throw new Error(`Indexing job not found: ${jobId}`);
      }

      // Skip processing if job is paused
      if (indexingJob.status !== 'active') {
        this.logger.log(`Skipping processing for paused job: ${jobId}`);
        return { success: true, status: 'skipped' };
      }

      // Add job to processing queue
      await this.indexingQueue.add('process-webhook-event', {
        jobId,
        payload,
      });

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      
      // Log error
      await this.prisma.webhookEvent.create({
        data: {
          webhookId: 'direct',
          indexingJobId: jobId,
          payload,
          status: 'error',
          error: error.message || 'Unknown error',
        },
      });
      
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
} 