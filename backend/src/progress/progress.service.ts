import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string) {
    const [completions, lessons] = await Promise.all([
      this.prisma.lessonCompletion.findMany({
        where: { userId },
        include: { lesson: true },
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.lesson.findMany({
        where: { isPublished: true },
        orderBy: { position: 'asc' },
      }),
    ]);
    const correctAnswers = completions.reduce(
      (total, item) => total + item.correctAnswers,
      0,
    );
    const totalQuestions = completions.reduce(
      (total, item) => total + item.totalQuestions,
      0,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      return {
        date: date.toISOString(),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: completions
          .filter(
            (item) =>
              item.completedAt >= date && item.completedAt < nextDate,
          )
          .reduce((total, item) => total + item.durationMinutes, 0),
      };
    });
    const completedDays = new Set(
      completions.map((item) => {
        const date = new Date(item.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    );
    let streakDays = 0;
    const cursor = new Date(today);
    while (completedDays.has(cursor.getTime())) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const skills = ['VOCABULARY', 'GRAMMAR', 'LISTENING'].map((category) => {
      const categoryLessons = lessons.filter(
        (lesson) => lesson.category === category,
      );
      const categoryCompletions = completions.filter(
        (item) => item.lesson.category === category,
      );
      const categoryQuestions = categoryCompletions.reduce(
        (total, item) => total + item.totalQuestions,
        0,
      );
      const categoryCorrect = categoryCompletions.reduce(
        (total, item) => total + item.correctAnswers,
        0,
      );

      return {
        accuracy:
          categoryQuestions === 0
            ? 0
            : Math.round((categoryCorrect / categoryQuestions) * 100),
        category: category.toLowerCase(),
        completed: categoryCompletions.length,
        progress:
          categoryLessons.length === 0
            ? 0
            : categoryCompletions.length / categoryLessons.length,
        total: categoryLessons.length,
      };
    });

    return {
      activity,
      accuracy:
        totalQuestions === 0
          ? 0
          : Math.round((correctAnswers / totalQuestions) * 100),
      learningMinutes: completions.reduce(
        (total, item) => total + item.durationMinutes,
        0,
      ),
      levelProgress:
        lessons.length === 0 ? 0 : completions.length / lessons.length,
      lessonsCompleted: completions.length,
      recentActivity: completions.slice(0, 5).map((item) => ({
        completedAt: item.completedAt,
        correctAnswers: item.correctAnswers,
        lessonId: item.lessonId,
        lessonTitle: item.lesson.title,
        totalQuestions: item.totalQuestions,
      })),
      skills,
      streakDays,
      totalXp: completions.reduce(
        (total, item) =>
          total + item.correctAnswers * 10 + item.attempts * 5 + 20,
        0,
      ),
    };
  }
}
