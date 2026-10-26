import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnglishLevel } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { PasswordService } from './password.service.js';

const REGISTRATION_LEVELS = {
  a1: EnglishLevel.A1,
  a2: EnglishLevel.A2,
  b1: EnglishLevel.B1,
  'b2-plus': EnglishLevel.B2_PLUS,
  unknown: EnglishLevel.UNKNOWN,
} as const;

type AuthResponse = {
  accessToken: string;
  user: {
    displayName: string;
    email: string;
    id: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
  ) {}

  async login(input: LoginDto): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user?.passwordHash ||
      !(await this.passwordService.verify(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createResponse(user);
  }

  async register(input: RegisterDto): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('An account already uses this email');
    }

    const user = await this.prisma.user.create({
      data: {
        displayName: input.displayName.trim(),
        email,
        learningProfile: {
          create: {
            dailyGoal: input.dailyGoal,
            dailyReminder: input.dailyReminder,
            englishLevel: REGISTRATION_LEVELS[input.englishLevel],
            hapticFeedback: input.hapticFeedback,
            soundEffects: input.soundEffects,
          },
        },
        passwordHash: await this.passwordService.hash(input.password),
      },
    });

    return this.createResponse(user);
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    return {
      displayName: user.displayName,
      email: user.email,
      id: user.id,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private async createResponse(user: {
    displayName: string;
    email: string;
    id: string;
  }): Promise<AuthResponse> {
    return {
      accessToken: await this.jwtService.signAsync({
        email: user.email,
        sub: user.id,
      }),
      user: {
        displayName: user.displayName,
        email: user.email,
        id: user.id,
      },
    };
  }
}
