import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from 'pg';

@Injectable()
export class DatabaseConfigService {
  private readonly logger = new Logger(DatabaseConfigService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.databaseConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const dbConfig = await this.prisma.databaseConfig.findUnique({
      where: { id },
    });

    if (!dbConfig || dbConfig.userId !== userId) {
      throw new NotFoundException('Database configuration not found');
    }

    return dbConfig;
  }

  async create(userId: string, data: {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    databaseName: string;
    ssl: boolean;
  }) {
    // Validate connection before saving
    const connectionResult = await this.testConnection(data);

    // Create database config
    return this.prisma.databaseConfig.create({
      data: {
        ...data,
        userId,
        status: connectionResult.success ? 'connected' : 'error',
        error: connectionResult.success ? null : connectionResult.error,
        lastCheckedAt: new Date(),
      },
    });
  }

  async update(id: string, userId: string, data: {
    name?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    databaseName?: string;
    ssl?: boolean;
  }) {
    // Ensure database config exists and belongs to user
    await this.findById(id, userId);

    // If connection details changed, test the connection
    if (data.host || data.port || data.username || data.password || data.databaseName || data.ssl !== undefined) {
      const dbConfig = await this.prisma.databaseConfig.findUnique({
        where: { id },
      });

      const connectionData = {
        host: data.host || dbConfig.host,
        port: data.port || dbConfig.port,
        username: data.username || dbConfig.username,
        password: data.password || dbConfig.password,
        databaseName: data.databaseName || dbConfig.databaseName,
        ssl: data.ssl !== undefined ? data.ssl : dbConfig.ssl,
      };

      const connectionResult = await this.testConnection(connectionData);

      // Update with connection status
      return this.prisma.databaseConfig.update({
        where: { id },
        data: {
          ...data,
          status: connectionResult.success ? 'connected' : 'error',
          error: connectionResult.success ? null : connectionResult.error,
          lastCheckedAt: new Date(),
        },
      });
    }

    // If only name changed, simple update
    return this.prisma.databaseConfig.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    // Ensure database config exists and belongs to user
    await this.findById(id, userId);

    return this.prisma.databaseConfig.delete({
      where: { id },
    });
  }

  async testConnection(config: {
    host: string;
    port: number;
    username: string;
    password: string;
    databaseName: string;
    ssl: boolean;
  }) {
    const client = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.databaseName,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      await client.connect();
      await client.query('SELECT NOW()');
      this.logger.log(`Successfully connected to database at ${config.host}:${config.port}/${config.databaseName}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to connect to database: ${error.message}`, error.stack);
      return { success: false, error: error.message || 'Unknown error' };
    } finally {
      try {
        await client.end();
      } catch (e) {
        // Ignore errors during disconnect
      }
    }
  }
} 