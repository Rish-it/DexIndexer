import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    console.log('LocalStrategy validate called with email:', email);
    
    if (!email || typeof email !== 'string') {
      console.error('Invalid email format in LocalStrategy:', email);
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        console.log('LocalStrategy: Invalid credentials for email:', email);
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log('LocalStrategy: User validated successfully:', user.id);
      return user;
    } catch (error) {
      console.error('Error in LocalStrategy validate:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
} 