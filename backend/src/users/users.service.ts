import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    if (!email || typeof email !== 'string') {
      console.error('Invalid email provided to findByEmail:', email);
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      console.log('Looking up user by email:', email);
      return this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(email: string, password: string) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('Invalid email format in create:', email);
      throw new BadRequestException('Invalid email format');
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    
    try {
      // Check if user exists
      console.log('Checking if email already exists:', email);
      const existingUser = await this.findByEmail(email);
      
      if (existingUser) {
        console.log('Email already in use:', email);
        throw new ConflictException('Email already in use');
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user
      console.log('Creating new user with email:', email);
      return this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validatePassword(email: string, password: string) {
    if (!email || typeof email !== 'string') {
      console.error('Invalid email in validatePassword:', email);
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      console.log('Validating password for email:', email);
      const user = await this.findByEmail(email);
      
      if (!user) {
        console.log('User not found for email:', email);
        throw new NotFoundException('User not found');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation result:', isPasswordValid ? 'Valid' : 'Invalid');
      
      return isPasswordValid ? user : null;
    } catch (error) {
      console.error('Error validating password:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: { email?: string; password?: string }) {
    const updateData: any = {};
    
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
      updateData.email = data.email;
    }
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
} 