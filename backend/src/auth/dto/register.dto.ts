import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DAILY_GOALS,
  ENGLISH_LEVELS,
  type EnglishLevelId,
} from '../../profiles/dto/update-profile.dto.js';

export class RegisterDto {
  @IsInt()
  @IsIn(DAILY_GOALS)
  @Type(() => Number)
  dailyGoal!: number;

  @IsBoolean()
  dailyReminder!: boolean;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  displayName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsIn(ENGLISH_LEVELS)
  englishLevel!: EnglishLevelId;

  @IsBoolean()
  hapticFeedback!: boolean;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsBoolean()
  soundEffects!: boolean;
}
