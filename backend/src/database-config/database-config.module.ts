import { Module } from '@nestjs/common';
import { DatabaseConfigService } from './database-config.service';
import { DatabaseConfigController } from './database-config.controller';

@Module({
  providers: [DatabaseConfigService],
  controllers: [DatabaseConfigController],
  exports: [DatabaseConfigService],
})
export class DatabaseConfigModule {} 