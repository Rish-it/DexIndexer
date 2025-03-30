import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    console.log('Validating user with email:', email);
    
    if (!email || typeof email !== 'string') {
      console.error('Invalid email format:', email);
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      const user = await this.usersService.validatePassword(email, password);
      console.log('User validation result:', user ? 'Success' : 'Failed');
      return user;
    } catch (error) {
      console.error('Error validating user:', error);
      throw error;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string) {
    console.log('Registering user with email:', email);
    
    if (!email || !email.includes('@')) {
      console.error('Invalid email format:', email);
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      const user = await this.usersService.create(email, password);
      console.log('User created successfully:', user.id);
      return this.login(user);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
} 