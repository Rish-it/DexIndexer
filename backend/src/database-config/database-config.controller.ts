import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseConfigService } from './database-config.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('database-configs')
@Controller('database-configs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DatabaseConfigController {
  constructor(
    private databaseConfigService: DatabaseConfigService,
    private prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all database configurations for current user' })
  async findAll(@Req() req) {
    return this.databaseConfigService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific database configuration' })
  async findOne(@Param('id') id: string, @Req() req) {
    return this.databaseConfigService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new database configuration' })
  async create(@Body() createDto: {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    databaseName: string;
    ssl: boolean;
  }, @Req() req) {
    return this.databaseConfigService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a database configuration' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: {
      name?: string;
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      databaseName?: string;
      ssl?: boolean;
    },
    @Req() req
  ) {
    return this.databaseConfigService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a database configuration' })
  async remove(@Param('id') id: string, @Req() req) {
    return this.databaseConfigService.delete(id, req.user.id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test a database connection' })
  async testConnection(@Param('id') id: string, @Req() req) {
    const dbConfig = await this.databaseConfigService.findById(id, req.user.id);
    
    const testResult = await this.databaseConfigService.testConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      databaseName: dbConfig.databaseName,
      ssl: dbConfig.ssl,
    });

    // Update the database config with the test result
    if (testResult.success !== (dbConfig.status === 'connected')) {
      // Update status directly through prisma
      await this.prisma.databaseConfig.update({
        where: { id },
        data: {
          status: testResult.success ? 'connected' : 'error',
          error: testResult.success ? null : testResult.error,
          lastCheckedAt: new Date(),
        },
      });
    }

    return testResult;
  }
} 