import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CompleteLessonDto } from './dto/complete-lesson.dto.js';
import { LESSON_CATALOG } from './lesson-catalog.js';

@Injectable()
export class LessonsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await Promise.all(
      LESSON_CATALOG.map((lesson) =>
        this.prisma.lesson.upsert({
          where: { id: lesson.id },
          create: lesson,
          update: lesson,
        }),
      ),
    );
  }

  async findAllForUser(userId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { isPublished: true },
      include: { completions: { where: { userId } } },
      orderBy: { position: 'asc' },
    });
    const completedLessonIds = new Set(
      lessons.flatMap((lesson) =>
        lesson.completions.map((completion) => completion.lessonId),
      ),
    );

    return lessons.map(
      ({ completions, isInitiallyAvailable, position: _position, ...lesson }, index) => {
        const previousLesson = lessons[index - 1];
        const isUnlocked =
          isInitiallyAvailable ||
          (previousLesson !== undefined &&
            completedLessonIds.has(previousLesson.id));

        return {
          ...lesson,
          progress: completions.length > 0 ? 1 : 0,
          status:
            completions.length > 0
              ? ('completed' as const)
              : isUnlocked
                ? ('available' as const)
                : ('locked' as const),
        };
      },
    );
  }

  async complete(userId: string, lessonId: string, input: CompleteLessonDto) {
    if (input.correctAnswers > input.totalQuestions) {
      throw new BadRequestException(
        'correctAnswers cannot exceed totalQuestions',
      );
    }

    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, isPublished: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    if (input.totalQuestions !== lesson.exerciseCount) {
      throw new BadRequestException(
        'totalQuestions does not match the lesson catalog',
      );
    }

    const completion = await this.prisma.lessonCompletion.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        correctAnswers: input.correctAnswers,
        durationMinutes: input.durationMinutes,
        lessonId,
        totalQuestions: input.totalQuestions,
        userId,
      },
      update: {
        attempts: { increment: 1 },
        completedAt: new Date(),
        correctAnswers: input.correctAnswers,
        durationMinutes: { increment: input.durationMinutes },
        totalQuestions: input.totalQuestions,
      },
    });

    return {
      attempts: completion.attempts,
      completedAt: completion.completedAt,
      lessonId: completion.lessonId,
      score: Math.round(
        (completion.correctAnswers / completion.totalQuestions) * 100,
      ),
    };
  }
}
