import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HeliusService {
  private readonly logger = new Logger(HeliusService.name);
  private readonly baseUrl = 'https://api.helius.xyz/v0';
  private readonly apiKey: string;
  private readonly webhookBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HELIUS_API_KEY');
    this.webhookBaseUrl = this.configService.get<string>('HELIUS_WEBHOOK_BASE_URL');

    if (!this.apiKey) {
      this.logger.error('HELIUS_API_KEY is not defined!');
    }

    if (!this.webhookBaseUrl) {
      this.logger.error('HELIUS_WEBHOOK_BASE_URL is not defined!');
    }
  }

  async createWebhook(jobData: any) {
    try {
      // Generate filters based on indexing type
      const filters = this.generateFilters(jobData);

      // Determine transaction types to listen for
      const transactionTypes = this.getTransactionTypes(jobData);

      // Webhook URL will include job ID once created
      // We'll update it after job creation
      const webhookUrl = `${this.webhookBaseUrl}/placeholder`;

      const requestBody = {
        webhook: {
          webhookURL: webhookUrl,
          transactionTypes,
          accountAddresses: this.getAccountAddresses(jobData),
          webhookType: 'enhanced',
          filters,
        },
      };

      // Log the request for debugging
      this.logger.debug(`Creating webhook with request: ${JSON.stringify(requestBody)}`);
      this.logger.debug(`Request URL: ${this.baseUrl}/webhooks?api-key=${this.apiKey}`);

      try {
        const response = await axios.post(
          `${this.baseUrl}/webhooks?api-key=${this.apiKey}`,
          requestBody
        );

        return {
          success: true,
          webhookId: response.data.webhookID,
        };
      } catch (error: any) {
        this.logger.error(`Failed to create Helius webhook: ${error.message}`);
        
        // Log detailed error information
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          this.logger.error(`Status: ${error.response.status}`);
          this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
          this.logger.error(`Headers: ${JSON.stringify(error.response.headers)}`);
        } else if (error.request) {
          // The request was made but no response was received
          this.logger.error(`No response received: ${error.request}`);
        }
        
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Unknown error',
        };
      }
    } catch (error: any) {
      this.logger.error(`Error in createWebhook: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async updateWebhook(webhookId: string, jobId: string) {
    try {
      // Update the webhook URL to include the job ID
      const webhookUrl = `${this.webhookBaseUrl}/${jobId}`;

      await axios.put(
        `${this.baseUrl}/webhooks/${webhookId}?api-key=${this.apiKey}`,
        {
          webhookURL: webhookUrl,
        },
      );

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to update Helius webhook: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async pauseWebhook(webhookId: string) {
    try {
      await axios.post(
        `${this.baseUrl}/webhooks/${webhookId}/pause?api-key=${this.apiKey}`,
      );

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to pause Helius webhook: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async resumeWebhook(webhookId: string) {
    try {
      await axios.post(
        `${this.baseUrl}/webhooks/${webhookId}/resume?api-key=${this.apiKey}`,
      );

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to resume Helius webhook: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async deleteWebhook(webhookId: string) {
    try {
      await axios.delete(
        `${this.baseUrl}/webhooks/${webhookId}?api-key=${this.apiKey}`,
      );

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to delete Helius webhook: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async fetchInitialData(indexingJob: any) {
    // This would fetch initial data based on the indexing type
    // For example, for NFT bids, it might fetch all current active bids for configured collections
    
    try {
      switch (indexingJob.type) {
        case 'nft_bids':
          return this.fetchInitialNftBids(indexingJob.config);
        case 'nft_prices':
          return this.fetchInitialNftPrices(indexingJob.config);
        case 'token_borrowing':
          return this.fetchInitialTokenBorrowing(indexingJob.config);
        case 'token_prices':
          return this.fetchInitialTokenPrices(indexingJob.config);
        default:
          throw new Error(`Unsupported indexing type: ${indexingJob.type}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to fetch initial data: ${error.message}`, error.stack);
      return [];
    }
  }

  private async fetchInitialNftBids(config: any) {
    // Example implementation to fetch initial NFT bids
    // This would use Helius APIs to get current bids for the configured collections
    const results = [];

    // For each collection in the config
    if (config.collections && config.collections.length > 0) {
      for (const collection of config.collections) {
        try {
          // This is a placeholder - actual implementation would use appropriate Helius API
          const response = await axios.get(
            `${this.baseUrl}/nft-events?api-key=${this.apiKey}&collection=${collection}&type=bid`,
          );

          if (response.data && Array.isArray(response.data)) {
            for (const bid of response.data) {
              // Transform bid data into the format we need
              results.push({
                collection: bid.collection,
                mint: bid.mint,
                price: bid.price,
                marketplace: bid.marketplace,
                bidder: bid.bidder,
                expiry: bid.expiry ? new Date(bid.expiry) : null,
              });
            }
          }
        } catch (error: any) {
          this.logger.error(`Error fetching bids for collection ${collection}: ${error.message}`);
        }
      }
    }

    return results;
  }

  private async fetchInitialNftPrices(config: any) {
    // Similar to fetchInitialNftBids but for listings/prices
    return [];
  }

  private async fetchInitialTokenBorrowing(config: any) {
    // Fetch initial token borrowing data
    return [];
  }

  private async fetchInitialTokenPrices(config: any) {
    // Fetch initial token prices data
    return [];
  }

  private generateFilters(jobData: any): object {
    // Different filters based on indexing type
    switch (jobData.type) {
      case 'nft_bids':
        return {
          programIds: [
            'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8', // Magic Eden
            'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk', // Tensor
            // Other marketplace programs
          ],
        };
      case 'nft_prices':
        return {
          programIds: [
            'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8', // Magic Eden
            'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk', // Tensor
            // Other marketplace programs
          ],
        };
      // Other filter types...
      default:
        return {};
    }
  }

  private getTransactionTypes(jobData: any): string[] {
    // Define which transaction types to listen for based on indexing type
    switch (jobData.type) {
      case 'nft_bids':
        return ['NFT_BID'];
      case 'nft_prices':
        return ['NFT_LISTING', 'NFT_SALE'];
      case 'token_borrowing':
        return ['TOKEN_TRANSFER', 'SWAP', 'UNKNOWN'];
      case 'token_prices':
        return ['SWAP', 'UNKNOWN'];
      default:
        return ['UNKNOWN'];
    }
  }

  private getAccountAddresses(jobData: any): string[] {
    // For token indexing, we might want to watch specific token mint addresses
    // For NFT indexing, we might want to watch specific collection addresses
    
    const addresses: string[] = [];
    
    if (jobData.type === 'token_prices' || jobData.type === 'token_borrowing') {
      if (jobData.config.tokens && Array.isArray(jobData.config.tokens)) {
        addresses.push(...jobData.config.tokens);
      }
    }
    
    return addresses;
  }
} 