import { IsInt, Max, Min } from 'class-validator';

export class CompleteLessonDto {
  @IsInt()
  @Min(0)
  @Max(1000)
  correctAnswers: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  totalQuestions: number;

  @IsInt()
  @Min(0)
  @Max(600)
  durationMinutes: number;
}
