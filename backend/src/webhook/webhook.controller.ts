import { Controller, Post, Body, Param, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private webhookService: WebhookService) {}

  @Post(':jobId')
  async handleWebhook(@Param('jobId') jobId: string, @Body() payload: any) {
    this.logger.log(`Webhook received for job ID: ${jobId}`);
    return this.webhookService.processWebhook(jobId, payload);
  }
} 