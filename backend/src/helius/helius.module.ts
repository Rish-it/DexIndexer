import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HeliusService } from './helius.service';

@Module({
  imports: [ConfigModule],
  providers: [HeliusService],
  exports: [HeliusService],
})
export class HeliusModule {} 