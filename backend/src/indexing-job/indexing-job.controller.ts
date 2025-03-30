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
import { IndexingJobService } from './indexing-job.service';

@ApiTags('indexing-jobs')
@Controller('indexing-jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IndexingJobController {
  constructor(private indexingJobService: IndexingJobService) {}

  @Get()
  @ApiOperation({ summary: 'Get all indexing jobs for current user' })
  async findAll(@Req() req) {
    return this.indexingJobService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific indexing job' })
  async findOne(@Param('id') id: string, @Req() req) {
    return this.indexingJobService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new indexing job' })
  async create(@Body() createDto: {
    name: string;
    databaseConfigId: string;
    type: string;
    config: any;
  }, @Req() req) {
    return this.indexingJobService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an indexing job' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: {
      name?: string;
      config?: any;
    },
    @Req() req
  ) {
    return this.indexingJobService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an indexing job' })
  async remove(@Param('id') id: string, @Req() req) {
    return this.indexingJobService.delete(id, req.user.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause an indexing job' })
  async pause(@Param('id') id: string, @Req() req) {
    return this.indexingJobService.pause(id, req.user.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume an indexing job' })
  async resume(@Param('id') id: string, @Req() req) {
    return this.indexingJobService.resume(id, req.user.id);
  }
} 