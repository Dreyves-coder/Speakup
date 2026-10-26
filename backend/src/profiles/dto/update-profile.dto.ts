import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsString, Length } from 'class-validator';

export const DAILY_GOALS = [5, 10, 15, 20] as const;
export const ENGLISH_LEVELS = ['a1', 'a2', 'b1', 'b2-plus', 'unknown'] as const;

export type EnglishLevelId = (typeof ENGLISH_LEVELS)[number];

export class UpdateProfileDto {
  @IsInt()
  @IsIn(DAILY_GOALS)
  @Type(() => Number)
  dailyGoal!: number;

  @IsBoolean()
  dailyReminder!: boolean;

  @IsString()
  @Length(2, 60)
  displayName!: string;

  @IsIn(ENGLISH_LEVELS)
  englishLevel!: EnglishLevelId;

  @IsBoolean()
  hapticFeedback!: boolean;

  @IsBoolean()
  soundEffects!: boolean;
}
