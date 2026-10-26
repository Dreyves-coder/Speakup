import { Injectable } from '@nestjs/common';
import { EnglishLevel } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  type EnglishLevelId,
  UpdateProfileDto,
} from './dto/update-profile.dto.js';

export type ProfileResponse = {
  dailyGoal: number;
  dailyReminder: boolean;
  displayName: string;
  englishLevel: EnglishLevelId;
  hapticFeedback: boolean;
  soundEffects: boolean;
};

const API_TO_DATABASE_LEVEL: Record<EnglishLevelId, EnglishLevel> = {
  a1: EnglishLevel.A1,
  a2: EnglishLevel.A2,
  b1: EnglishLevel.B1,
  'b2-plus': EnglishLevel.B2_PLUS,
  unknown: EnglishLevel.UNKNOWN,
};

const DATABASE_TO_API_LEVEL: Record<EnglishLevel, EnglishLevelId> = {
  [EnglishLevel.A1]: 'a1',
  [EnglishLevel.A2]: 'a2',
  [EnglishLevel.B1]: 'b1',
  [EnglishLevel.B2_PLUS]: 'b2-plus',
  [EnglishLevel.UNKNOWN]: 'unknown',
};

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const profile = await this.prisma.learningProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return this.toResponse(user.displayName, profile);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const result = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        where: { id: userId },
        data: { displayName: input.displayName.trim() },
      });

      const profile = await transaction.learningProfile.upsert({
        where: { userId: user.id },
        update: {
          dailyGoal: input.dailyGoal,
          dailyReminder: input.dailyReminder,
          englishLevel: API_TO_DATABASE_LEVEL[input.englishLevel],
          hapticFeedback: input.hapticFeedback,
          soundEffects: input.soundEffects,
        },
        create: {
          dailyGoal: input.dailyGoal,
          dailyReminder: input.dailyReminder,
          englishLevel: API_TO_DATABASE_LEVEL[input.englishLevel],
          hapticFeedback: input.hapticFeedback,
          soundEffects: input.soundEffects,
          userId: user.id,
        },
      });

      return { profile, user };
    });

    return this.toResponse(result.user.displayName, result.profile);
  }

  private toResponse(
    displayName: string,
    profile: {
      dailyGoal: number;
      dailyReminder: boolean;
      englishLevel: EnglishLevel;
      hapticFeedback: boolean;
      soundEffects: boolean;
    },
  ): ProfileResponse {
    return {
      dailyGoal: profile.dailyGoal,
      dailyReminder: profile.dailyReminder,
      displayName,
      englishLevel: DATABASE_TO_API_LEVEL[profile.englishLevel],
      hapticFeedback: profile.hapticFeedback,
      soundEffects: profile.soundEffects,
    };
  }
}
