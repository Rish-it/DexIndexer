import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Pool } from 'pg';
import { IndexingJobService } from './indexing-job.service';
import { HeliusService } from '../helius/helius.service';

@Processor('indexing')
export class IndexingProcessor {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    private indexingJobService: IndexingJobService,
    private heliusService: HeliusService,
  ) {}

  @Process('initial-data-fetch')
  async handleInitialDataFetch(job: Job<{ jobId: string }>) {
    this.logger.log(`Processing initial data fetch for job ${job.data.jobId}`);
    
    try {
      // Get the indexing job details
      const indexingJob = await this.indexingJobService.findById(job.data.jobId);
      
      // Fetch initial data from Helius
      const initialData = await this.heliusService.fetchInitialData(indexingJob);
      
      if (initialData.length === 0) {
        this.logger.log(`No initial data to process for job ${job.data.jobId}`);
        // Activate the job, which was in pending state
        await this.indexingJobService.activate(job.data.jobId);
        return;
      }

      // Connect to user's database
      const pool = new Pool({
        host: indexingJob.databaseConfig.host,
        port: indexingJob.databaseConfig.port,
        user: indexingJob.databaseConfig.username,
        password: indexingJob.databaseConfig.password,
        database: indexingJob.databaseConfig.databaseName,
        ssl: indexingJob.databaseConfig.ssl ? 
          { rejectUnauthorized: false } : false,
      });

      const client = await pool.connect();
      
      try {
        // Create table if it doesn't exist
        await this.ensureTableExists(client, indexingJob);
        
        // Insert data
        await this.insertDataBatch(client, indexingJob, initialData);
        
        // Update job statistics
        await this.indexingJobService.updateStatistics(
          job.data.jobId,
          initialData.length,
        );
        
        // Activate the job
        await this.indexingJobService.activate(job.data.jobId);
        
        this.logger.log(`Successfully processed initial data for job ${job.data.jobId}`);
      } finally {
        client.release();
        await pool.end();
      }
    } catch (error: any) {
      this.logger.error(`Error processing initial data: ${error.message}`, error.stack);
      await this.indexingJobService.updateStatistics(
        job.data.jobId,
        0,
        0,
        error.message || 'Unknown error',
      );
    }
  }

  @Process('process-webhook-event')
  async handleWebhookEvent(job: Job<{ jobId: string; payload: any }>) {
    this.logger.log(`Processing webhook event for job ${job.data.jobId}`);
    const startTime = Date.now();
    
    try {
      // Get the indexing job details
      const indexingJob = await this.indexingJobService.findById(job.data.jobId);
      
      // Skip if job is not active
      if (indexingJob.status !== 'active') {
        this.logger.log(`Skipping webhook event for inactive job ${job.data.jobId}`);
        return;
      }
      
      // Transform webhook data into appropriate format
      const transformedData = this.transformData(indexingJob, job.data.payload);
      
      if (transformedData.length === 0) {
        this.logger.log(`No data to process from webhook event for job ${job.data.jobId}`);
        return;
      }
      
      // Connect to user's database
      const pool = new Pool({
        host: indexingJob.databaseConfig.host,
        port: indexingJob.databaseConfig.port,
        user: indexingJob.databaseConfig.username,
        password: indexingJob.databaseConfig.password,
        database: indexingJob.databaseConfig.databaseName,
        ssl: indexingJob.databaseConfig.ssl ? 
          { rejectUnauthorized: false } : false,
      });

      const client = await pool.connect();
      
      try {
        // Insert data
        await this.insertDataBatch(client, indexingJob, transformedData);
      } finally {
        client.release();
        await pool.end();
      }
      
      // Update statistics
      const processingTime = Date.now() - startTime;
      await this.indexingJobService.updateStatistics(
        job.data.jobId,
        transformedData.length,
        processingTime,
      );
      
      this.logger.log(`Webhook event processed for job: ${job.data.jobId}`);
    } catch (error: any) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      await this.indexingJobService.updateStatistics(
        job.data.jobId,
        0,
        0,
        error.message || 'Unknown error',
      );
    }
  }

  private async ensureTableExists(client: any, indexingJob: any) {
    const tableName = indexingJob.config.tableName;
    
    // Create table based on the indexing type
    switch (indexingJob.type) {
      case 'nft_bids':
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            collection TEXT NOT NULL,
            mint TEXT NOT NULL,
            price NUMERIC NOT NULL,
            marketplace TEXT NOT NULL,
            bidder TEXT NOT NULL,
            expiry TIMESTAMP,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            UNIQUE(mint, bidder)
          )
        `);
        break;
        
      case 'nft_prices':
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            collection TEXT NOT NULL,
            mint TEXT NOT NULL,
            price NUMERIC NOT NULL,
            marketplace TEXT NOT NULL,
            seller TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            UNIQUE(mint, seller)
          )
        `);
        break;
        
      case 'token_borrowing':
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            token TEXT NOT NULL,
            amount NUMERIC NOT NULL,
            platform TEXT NOT NULL,
            interest_rate NUMERIC NOT NULL,
            available BOOLEAN NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            UNIQUE(token, platform)
          )
        `);
        break;
        
      case 'token_prices':
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            token TEXT NOT NULL,
            price NUMERIC NOT NULL,
            platform TEXT NOT NULL,
            volume_24h NUMERIC,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            UNIQUE(token, platform)
          )
        `);
        break;
        
      default:
        throw new Error(`Unsupported indexing type: ${indexingJob.type}`);
    }
  }

  private async insertDataBatch(client: any, indexingJob: any, data: any[]) {
    if (!data || data.length === 0) {
      return;
    }

    const tableName = indexingJob.config.tableName;

    switch (indexingJob.type) {
      case 'nft_bids':
        for (const item of data) {
          await client.query(
            `INSERT INTO ${tableName} 
            (collection, mint, price, marketplace, bidder, expiry, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (mint, bidder) 
            DO UPDATE SET 
              price = EXCLUDED.price,
              expiry = EXCLUDED.expiry,
              updated_at = EXCLUDED.updated_at`,
            [
              item.collection,
              item.mint,
              item.price,
              item.marketplace,
              item.bidder,
              item.expiry,
              new Date(),
              new Date(),
            ],
          );
        }
        break;

      case 'nft_prices':
        for (const item of data) {
          await client.query(
            `INSERT INTO ${tableName} 
            (collection, mint, price, marketplace, seller, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (mint, seller) 
            DO UPDATE SET 
              price = EXCLUDED.price,
              updated_at = EXCLUDED.updated_at`,
            [
              item.collection,
              item.mint,
              item.price,
              item.marketplace,
              item.seller,
              new Date(),
              new Date(),
            ],
          );
        }
        break;

      case 'token_borrowing':
        for (const item of data) {
          await client.query(
            `INSERT INTO ${tableName} 
            (token, amount, platform, interest_rate, available, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (token, platform) 
            DO UPDATE SET 
              amount = EXCLUDED.amount,
              interest_rate = EXCLUDED.interest_rate,
              available = EXCLUDED.available,
              updated_at = EXCLUDED.updated_at`,
            [
              item.token,
              item.amount,
              item.platform,
              item.interestRate,
              item.available,
              new Date(),
              new Date(),
            ],
          );
        }
        break;

      case 'token_prices':
        for (const item of data) {
          await client.query(
            `INSERT INTO ${tableName} 
            (token, price, platform, volume_24h, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (token, platform) 
            DO UPDATE SET 
              price = EXCLUDED.price,
              volume_24h = EXCLUDED.volume_24h,
              updated_at = EXCLUDED.updated_at`,
            [
              item.token,
              item.price,
              item.platform,
              item.volume24h,
              new Date(),
              new Date(),
            ],
          );
        }
        break;
    }
  }

  private transformData(indexingJob: any, payload: any): any[] {
    // Transform Helius webhook data into the format for the user's database
    switch (indexingJob.type) {
      case 'nft_bids':
        return this.transformNftBidsData(payload, indexingJob.config);
      case 'nft_prices':
        return this.transformNftPricesData(payload, indexingJob.config);
      case 'token_borrowing':
        return this.transformTokenBorrowingData(payload, indexingJob.config);
      case 'token_prices':
        return this.transformTokenPricesData(payload, indexingJob.config);
      default:
        throw new Error(`Unsupported indexing type: ${indexingJob.type}`);
    }
  }

  private transformNftBidsData(payload: any, config: any): any[] {
    // Example transformation for NFT bids
    const result = [];

    if (Array.isArray(payload)) {
      for (const tx of payload) {
        if (tx.type !== 'NFT_BID' || !tx.events || !tx.events.nft) {
          continue;
        }

        for (const event of tx.events.nft) {
          // Check if matches configured collections
          if (config.collections && config.collections.length > 0) {
            if (!config.collections.includes(event.collection)) {
              continue;
            }
          }

          // Check if matches configured marketplaces
          if (config.marketplaces && config.marketplaces.length > 0) {
            if (!config.marketplaces.includes(event.marketplace)) {
              continue;
            }
          }

          result.push({
            collection: event.collection,
            mint: event.mint,
            price: event.amount,
            marketplace: event.marketplace,
            bidder: event.bidder,
            expiry: event.expiry ? new Date(event.expiry) : null,
          });
        }
      }
    }

    return result;
  }

  private transformNftPricesData(payload: any, config: any): any[] {
    // Example transformation for NFT prices
    const result = [];

    if (Array.isArray(payload)) {
      for (const tx of payload) {
        if (tx.type !== 'NFT_LISTING' || !tx.events || !tx.events.nft) {
          continue;
        }

        for (const event of tx.events.nft) {
          // Check if matches configured collections
          if (config.collections && config.collections.length > 0) {
            if (!config.collections.includes(event.collection)) {
              continue;
            }
          }

          // Check if matches configured marketplaces
          if (config.marketplaces && config.marketplaces.length > 0) {
            if (!config.marketplaces.includes(event.marketplace)) {
              continue;
            }
          }

          result.push({
            collection: event.collection,
            mint: event.mint,
            price: event.amount,
            marketplace: event.marketplace,
            seller: event.seller,
          });
        }
      }
    }

    return result;
  }

  private transformTokenBorrowingData(payload: any, config: any): any[] {
    // Example transformation for token borrowing data
    const result = [];

    // Implementation would depend on specific Helius payload structure for this data
    // This is a placeholder implementation

    return result;
  }

  private transformTokenPricesData(payload: any, config: any): any[] {
    // Example transformation for token prices data
    const result = [];

    // Implementation would depend on specific Helius payload structure for this data
    // This is a placeholder implementation

    return result;
  }
} 