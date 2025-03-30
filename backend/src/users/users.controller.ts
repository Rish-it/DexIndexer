import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.id);
    
    // Remove sensitive fields
    const { password, ...result } = user;
    return result;
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Req() req,
    @Body() updateData: { email?: string; password?: string },
  ) {
    const updatedUser = await this.usersService.updateProfile(req.user.id, updateData);
    
    // Remove sensitive fields
    const { password, ...result } = updatedUser;
    return result;
  }
} 