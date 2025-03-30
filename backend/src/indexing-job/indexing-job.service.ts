import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { HeliusService } from '../helius/helius.service';

@Injectable()
export class IndexingJobService {
  private readonly logger = new Logger(IndexingJobService.name);

  constructor(
    private prisma: PrismaService,
    private heliusService: HeliusService,
    @InjectQueue('indexing') private indexingQueue: Queue,
  ) {}

  async findAll(userId: string) {
    return this.prisma.indexingJob.findMany({
      where: { userId },
      include: {
        databaseConfig: {
          select: {
            id: true,
            name: true,
            host: true,
            port: true,
            databaseName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId?: string) {
    const job = await this.prisma.indexingJob.findUnique({
      where: { id },
      include: {
        databaseConfig: {
          select: {
            id: true,
            name: true,
            host: true,
            port: true,
            username: true,
            password: true,
            databaseName: true,
            ssl: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Indexing job not found');
    }

    // If userId is provided, check ownership
    if (userId && job.userId !== userId) {
      throw new NotFoundException('Indexing job not found');
    }

    return job;
  }

  async create(userId: string, data: {
    name: string;
    databaseConfigId: string;
    type: string;
    config: any;
  }) {
    // Validate database config
    const dbConfig = await this.prisma.databaseConfig.findUnique({
      where: { id: data.databaseConfigId },
    });

    if (!dbConfig || dbConfig.userId !== userId) {
      throw new NotFoundException('Database configuration not found');
    }

    // Create indexing job
    const job = await this.prisma.indexingJob.create({
      data: {
        ...data,
        userId,
        status: 'pending',
      },
    });

    // TEMP: Skip webhook creation for testing
    this.logger.log('Skipping webhook creation for testing purposes');
    
    // Mark job as active immediately for testing
    const updatedJob = await this.prisma.indexingJob.update({
      where: { id: job.id },
      data: {
        status: 'active',
      },
    });

    // Start initial data fetch
    await this.indexingQueue.add('initial-data-fetch', {
      jobId: job.id,
    });

    return updatedJob;

    /* --- Original webhook code commented out for testing ---
    // Setup webhook with Helius
    const webhookResult = await this.heliusService.createWebhook(job);

    if (!webhookResult.success) {
      // Update job with error
      await this.prisma.indexingJob.update({
        where: { id: job.id },
        data: {
          status: 'error',
          error: `Failed to create webhook: ${webhookResult.error}`,
        },
      });

      throw new ConflictException(`Failed to create webhook: ${webhookResult.error}`);
    }

    // Update job with webhook ID
    const updatedJob = await this.prisma.indexingJob.update({
      where: { id: job.id },
      data: {
        webhookId: webhookResult.webhookId,
      },
    });

    // Update webhook URL to include job ID
    await this.heliusService.updateWebhook(webhookResult.webhookId, job.id);

    // Start initial data fetch
    await this.indexingQueue.add('initial-data-fetch', {
      jobId: job.id,
    });

    return updatedJob;
    */
  }

  async update(id: string, userId: string, data: {
    name?: string;
    config?: any;
  }) {
    // Ensure job exists and belongs to user
    await this.findById(id, userId);

    // Update job
    return this.prisma.indexingJob.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    // Ensure job exists and belongs to user
    const job = await this.findById(id, userId);

    // Delete webhook if exists
    if (job.webhookId) {
      await this.heliusService.deleteWebhook(job.webhookId);
    }

    // Delete job
    return this.prisma.indexingJob.delete({
      where: { id },
    });
  }

  async pause(id: string, userId: string) {
    // Ensure job exists and belongs to user
    const job = await this.findById(id, userId);

    if (job.status !== 'active') {
      throw new ConflictException('Job is not active');
    }

    // Pause webhook
    if (job.webhookId) {
      await this.heliusService.pauseWebhook(job.webhookId);
    }

    // Update job status
    return this.prisma.indexingJob.update({
      where: { id },
      data: {
        status: 'paused',
      },
    });
  }

  async resume(id: string, userId: string) {
    // Ensure job exists and belongs to user
    const job = await this.findById(id, userId);

    if (job.status !== 'paused') {
      throw new ConflictException('Job is not paused');
    }

    // Resume webhook
    if (job.webhookId) {
      await this.heliusService.resumeWebhook(job.webhookId);
    }

    // Update job status
    return this.prisma.indexingJob.update({
      where: { id },
      data: {
        status: 'active',
      },
    });
  }

  async activate(id: string) {
    const job = await this.findById(id);

    if (job.status !== 'pending') {
      throw new ConflictException('Job is not in pending state');
    }

    // Update job status
    return this.prisma.indexingJob.update({
      where: { id },
      data: {
        status: 'active',
      },
    });
  }

  async updateStatistics(
    jobId: string, 
    recordsAdded: number, 
    processingTime: number = 0, 
    error: string = null
  ) {
    const job = await this.findById(jobId);

    const updateData: any = {
      lastSyncAt: new Date(),
      recordsIndexed: job.recordsIndexed + recordsAdded,
    };

    if (error) {
      updateData.error = error;
      // Don't change status if already in error state
      if (job.status === 'active') {
        updateData.status = 'error';
      }
    } else if (job.status === 'error') {
      // Clear error if successful
      updateData.error = null;
      updateData.status = 'active';
    }

    return this.prisma.indexingJob.update({
      where: { id: jobId },
      data: updateData,
    });
  }
} 